export const taskQueryKeys = {
  all: ["tasks"] as const,
  list: (userId: string | undefined) => ["tasks", userId] as const,
}

  