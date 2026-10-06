export const taskQueryKeys = {
  all: ["tasks"] as const,
  list: (workspaceId: string | undefined) => ["tasks", workspaceId] as const,
}

export const workspaceQueryKeys = {
  current: ["workspace", "current"] as const,
  members: (workspaceId: string | undefined) => ["workspace", workspaceId, "members"] as const,
  memberSearch: (workspaceId: string | undefined, search: string) => ["workspace", workspaceId, "members", "search", search] as const,
  invitations: (workspaceId: string | undefined) => ["workspace", workspaceId, "invitations"] as const,
}

  
