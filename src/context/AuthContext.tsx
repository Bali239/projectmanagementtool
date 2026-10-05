"use client"

import { App } from "antd"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { authLoading, authUserChanged, type AuthUser } from "@/store/authSlice"
import { getCurrentUser } from "@/lib/api/auth"
import { getCurrentWorkspace, type WorkspaceSummary } from "@/lib/api/workspaces"
import LoadingState from "@/components/LoadingState"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  workspace: WorkspaceSummary | null
  workspaceLoading: boolean
  refreshWorkspace: (userId?: string) => Promise<WorkspaceSummary | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const status = useAppSelector((state) => state.auth.status)
  const [workspaceState, setWorkspaceState] = useState<{
    userId: string | null
    workspace: WorkspaceSummary | null
    loading: boolean
  }>({ userId: null, workspace: null, loading: true })

  useEffect(() => {
    dispatch(authLoading())
    getCurrentUser()
      .then(({ user: currentUser }) => dispatch(authUserChanged(currentUser)))
      .catch(() => dispatch(authUserChanged(null)))
  }, [dispatch])

  useEffect(() => {
    if (!user) return
    let active = true
    getCurrentWorkspace()
      .then(({ workspace: currentWorkspace }) => {
        if (active) setWorkspaceState({ userId: user.uid, workspace: currentWorkspace, loading: false })
      })
      .catch(() => {
        if (active) setWorkspaceState({ userId: user.uid, workspace: null, loading: false })
      })

    return () => { active = false }
  }, [user])

  const currentUserId = user?.uid ?? null
  const workspace = workspaceState.userId === currentUserId ? workspaceState.workspace : null
  const workspaceLoading = currentUserId !== null && (workspaceState.userId !== currentUserId || workspaceState.loading)

  async function refreshWorkspace(userId = user?.uid) {
    const { workspace: currentWorkspace } = await getCurrentWorkspace()
    if (userId) setWorkspaceState({ userId, workspace: currentWorkspace, loading: false })
    return currentWorkspace
  }

  return (
    <AuthContext.Provider value={{ user, loading: status === "loading", workspace, workspaceLoading, refreshWorkspace }}>
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
  const dispatch = useAppDispatch()
  const { user, loading } = useAuth()
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (!active) return
        dispatch(authUserChanged(currentUser))
        if (currentUser) {
          message.info({ content: "You are already logged in.", key: "already-logged-in" })
          router.replace("/dashboard")
        }
      })
      .catch(() => {
        if (active) dispatch(authUserChanged(null))
      })
      .finally(() => {
        if (active) setCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [dispatch, message, router])

  if (loading || checkingSession || user) {
    return <LoadingState className="min-h-screen bg-slate-50" message={user ? "Redirecting to your workspace..." : "Checking your account..."} />
  }

  return children
}
