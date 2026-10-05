import { apiRequest } from "@/lib/api/client"
import type { AuthUser } from "@/store/authSlice"

export function getCurrentUser() {
  return apiRequest<{ user: AuthUser }>("/auth/me")
}

export function logout() {
  return apiRequest<{ message: string }>("/auth/logout", { method: "POST" })
}

export function signupWithEmail(input: { name: string; email: string; password: string; inviteToken?: string }) {
  return apiRequest<{ message: string }>("/auth/signup", { method: "POST", data: input })
}

export function loginWithEmail(input: { email: string; password: string }) {
  return apiRequest<{ user: AuthUser }>("/auth/login", { method: "POST", data: input })
}

export function requestPasswordReset(email: string) {
  return apiRequest<{ message: string }>("/auth/forgot-password", { method: "POST", data: { email } })
}

export function resetPassword(input: { email: string; token: string; password: string }) {
  return apiRequest<{ message: string }>("/auth/reset-password", { method: "POST", data: input })
}

export function verifyEmail(token: string) {
  return apiRequest<{ message: string; workspaceJoined?: boolean }>("/auth/verify-email", { method: "POST", data: { token } })
}

export function resendVerification(email: string) {
  return apiRequest<{ message: string }>("/auth/resend-verification", { method: "POST", data: { email } })
}