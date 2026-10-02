import { apiRequest } from "@/lib/api/client"
import type { AuthUser } from "@/store/authSlice"

export function getCurrentUser() {
  return apiRequest<{ user: AuthUser }>("/auth/me")
}

export function logout() {
  return apiRequest<{ message: string }>("/auth/logout", { method: "POST" })
}