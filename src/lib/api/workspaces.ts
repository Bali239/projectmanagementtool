import { apiRequest } from "@/lib/api/client"

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

export function getCurrentWorkspace() {
  return apiRequest<{ workspace: WorkspaceSummary | null }>("/workspaces/current")
}

export function listUserWorkspaces() {
  return apiRequest<UserWorkspaceList>("/workspaces")
}

export function createWorkspace(input: { name: string; timezone: string }) {
  return apiRequest<{ workspace: WorkspaceSummary }>("/workspaces", { method: "POST", data: input })
}

export function updateWorkspace(input: { name?: string; photo?: File }) {
  const formData = new FormData()
  if (input.name !== undefined) formData.append("name", input.name)
  if (input.photo) formData.append("photo", input.photo)
  return apiRequest<{ workspace: WorkspaceSummary }>("/workspaces/current", {
    method: "PATCH",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export function fetchWorkspaceMembers() {
  return apiRequest<WorkspaceMember[]>("/workspaces/members")
}

export function removeWorkspaceMember(userId: string) {
  return apiRequest<void>(`/workspaces/members/${userId}`, { method: "DELETE" })
}

export function fetchWorkspaceInvitations() {
  return apiRequest<WorkspaceInvitation[]>("/workspaces/invitations")
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
  return apiRequest<{ invitation: { email: string; workspaceName: string } }>(`/workspaces/invitations/preview/${token}`)
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