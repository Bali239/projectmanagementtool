import { apiRequest, workspaceRequestConfig } from "@/lib/api/client"

// Response types shared by workspace API calls and UI components.
export type WorkspaceSummary = {
  id: string
  name: string
  timezone: string
  photoUrl: string | null
  isCreator: boolean
  role: "admin" | "member"
}

export type WorkspaceLimits = {
  createdCount: number
  createdLimit: number
  membershipCount: number
  membershipLimit: number
}

export type UserWorkspaceList = {
  workspaces: WorkspaceSummary[]
  limits: WorkspaceLimits
}

export type WorkspaceMember = {
  id: string
  name: string
  email: string
  picture: string | null
  role: "admin" | "member"
  joinedAt: string
}

export type WorkspaceInvitation = {
  id: string
  email: string
  expiresAt: string
  createdAt: string
}

export type CsvInviteResult = {
  row: number
  email: string
  status: "sent" | "invalid" | "duplicate" | "already-member" | "failed"
  message?: string
}

// Workspace API functions keep endpoint paths and request payloads out of UI components.
export function getCurrentWorkspace() {
  return apiRequest<{ workspace: WorkspaceSummary | null }>("/workspaces/current")
}

export function listUserWorkspaces() {
  return apiRequest<UserWorkspaceList>("/workspaces")
}

export function createWorkspace(input: { name: string; photo?: File }) {
  const formData = new FormData()
  formData.append("name", input.name)
  // Keep the backend's timezone field populated while using UTC as the default.
  formData.append("timezone", "UTC")
  if (input.photo) formData.append("photo", input.photo)
  return apiRequest<{ workspace: WorkspaceSummary }>("/workspaces", {
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export function updateWorkspace(workspaceId: string, input: { name?: string; photo?: File }) {
  const formData = new FormData()
  if (input.name !== undefined) formData.append("name", input.name)
  if (input.photo) formData.append("photo", input.photo)
  return apiRequest<{ workspace: WorkspaceSummary }>(`/workspaces/${workspaceId}`, {
    method: "PATCH",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export function deleteWorkspace(workspaceId: string) {
  return apiRequest<void>(`/workspaces/${workspaceId}`, { method: "DELETE" })
}

export function fetchWorkspaceMembers(workspaceId?: string) {
  return apiRequest<WorkspaceMember[]>("/workspaces/members", workspaceRequestConfig(workspaceId))
}

export function searchWorkspaceMembers(search: string, workspaceId?: string) {
  return apiRequest<WorkspaceMember[]>(
    `/workspaces/members?search=${encodeURIComponent(search)}`,
    workspaceRequestConfig(workspaceId),
  )
}

export function removeWorkspaceMember(userId: string) {
  return apiRequest<void>(`/workspaces/members/${userId}`, { method: "DELETE" })
}

export function leaveWorkspace(workspaceId: string) {
  return apiRequest<void>("/workspaces/members/me", { method: "DELETE", headers: { "X-Workspace-Id": workspaceId } })
}

export function fetchWorkspaceInvitations(workspaceId?: string) {
  return apiRequest<WorkspaceInvitation[]>("/workspaces/invitations", workspaceRequestConfig(workspaceId))
}

export function createWorkspaceInvitation(email: string) {
  return apiRequest<{ invitation: WorkspaceInvitation }>("/workspaces/invitations", {
    method: "POST",
    data: { email },
  })
}

export function revokeWorkspaceInvitation(invitationId: string) {
  return apiRequest<void>(`/workspaces/invitations/${invitationId}`, { method: "DELETE" })
}

export function previewWorkspaceInvitation(token: string) {
  return apiRequest<{ invitation: { email: string; inviterEmail: string | null; workspaceName: string } }>(`/workspaces/invitations/preview/${token}`)
}

export function acceptWorkspaceInvitation(token: string) {
  return apiRequest<{ workspace: WorkspaceSummary }>("/workspaces/invitations/accept", {
    method: "POST",
    data: { token },
  })
}

export function importWorkspaceInvitations(csv: string) {
  return apiRequest<{ results: CsvInviteResult[]; summary: Record<string, number> }>("/workspaces/invitations/import", {
    method: "POST",
    data: csv,
    headers: { "Content-Type": "text/csv" },
  })
}
