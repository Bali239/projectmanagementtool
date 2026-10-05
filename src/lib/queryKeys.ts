export const taskQueryKeys = {
  all: ["tasks"] as const,
  list: (workspaceId: string | undefined) => ["tasks", workspaceId] as const,
}

export const workspaceQueryKeys = {
  current: ["workspace", "current"] as const,
  members: (workspaceId: string | undefined) => ["workspace", workspaceId, "members"] as const,
  invitations: (workspaceId: string | undefined) => ["workspace", workspaceId, "invitations"] as const,
}

  