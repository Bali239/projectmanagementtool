"use client"

import { App } from "antd"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { authLoading, authUserChanged, type AuthUser } from "@/store/authSlice"
import { getCurrentUser } from "@/lib/api/auth"
import LoadingState from "@/components/LoadingState"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const status = useAppSelector((state) => state.auth.status)

  useEffect(() => {
    dispatch(authLoading())
    getCurrentUser()
      .then(({ user: currentUser }) => dispatch(authUserChanged(currentUser)))
      .catch(() => dispatch(authUserChanged(null)))
  }, [dispatch])

  return (
    <AuthContext.Provider value={{ user, loading: status === "loading" }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [loading, router, user])

  if (loading || !user) {
    return <LoadingState className="min-h-screen bg-slate-50" message="Loading your workspace..." />
  }

  return children
}

export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { message } = App.useApp()
  const { user, loading } = useAuth()
  const redirectStarted = useRef(false)

  useEffect(() => {
    if (loading || !user || redirectStarted.current) return

    redirectStarted.current = true
    message.info({ content: "You are already logged in.", key: "already-logged-in" })
    router.replace("/dashboard")
  }, [loading, message, router, user])

  if (loading || user) {
    return <LoadingState className="min-h-screen bg-slate-50" message={loading ? "Checking your account..." : "Redirecting to your workspace..."} />
  }

  return children
}
