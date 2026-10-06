"use client"

import { App } from "antd"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { authLoading, authUserChanged, type AuthUser } from "@/store/authSlice"
import { getCurrentUser } from "@/lib/api/auth"
import { listUserWorkspaces, type WorkspaceLimits, type WorkspaceSummary } from "@/lib/api/workspaces"
import { ACTIVE_WORKSPACE_STORAGE_KEY } from "@/lib/api/client"
import LoadingState from "@/components/LoadingState"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  workspaces: WorkspaceSummary[]
  workspace: WorkspaceSummary | null
  workspaceLimits: WorkspaceLimits | null
  workspaceLoading: boolean
  workspaceError: string | null
  refreshWorkspaces: (userId?: string) => Promise<void>
  selectWorkspace: (workspaceId: string | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const status = useAppSelector((state) => state.auth.status)
  const [workspaceState, setWorkspaceState] = useState<{
    userId: string | null
    workspaces: WorkspaceSummary[]
    limits: WorkspaceLimits | null
    loading: boolean
    error: string | null
  }>({ userId: null, workspaces: [], limits: null, loading: true, error: null })
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(authLoading())
    getCurrentUser()
      .then(({ user: currentUser }) => dispatch(authUserChanged(currentUser)))
      .catch(() => dispatch(authUserChanged(null)))
  }, [dispatch])

  useEffect(() => {
    if (status === "loading") return
    if (!user) {
      window.sessionStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY)
      setActiveWorkspaceId(null)
      setWorkspaceState({ userId: null, workspaces: [], limits: null, loading: false, error: null })
      return
    }
    let active = true
    listUserWorkspaces()
      .then((result) => {
        if (!active) return
        const savedWorkspaceId = window.sessionStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)
        const selectedWorkspaceId = result.workspaces.some(({ id }) => id === savedWorkspaceId) ? savedWorkspaceId : null
        setActiveWorkspaceId(selectedWorkspaceId)
        setWorkspaceState({ userId: user.uid, workspaces: result.workspaces, limits: result.limits, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (active) setWorkspaceState({
          userId: user.uid,
          workspaces: [],
          limits: null,
          loading: false,
          error: error instanceof Error ? error.message : "Workspaces could not be loaded.",
        })
      })

    return () => { active = false }
  }, [status, user])

  const currentUserId = user?.uid ?? null
  const workspaces = workspaceState.userId === currentUserId ? workspaceState.workspaces : []
  const workspace = workspaces.find(({ id }) => id === activeWorkspaceId) || null
  const workspaceLoading = currentUserId !== null && (workspaceState.userId !== currentUserId || workspaceState.loading)

  async function refreshWorkspaces(userId = user?.uid) {
    const result = await listUserWorkspaces()
    if (userId) setWorkspaceState({ userId, workspaces: result.workspaces, limits: result.limits, loading: false, error: null })
  }

  function selectWorkspace(workspaceId: string | null) {
    if (workspaceId) window.sessionStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId)
    else window.sessionStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY)
    setActiveWorkspaceId(workspaceId)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading: status === "loading",
      workspaces,
      workspace,
      workspaceLimits: workspaceState.userId === currentUserId ? workspaceState.limits : null,
      workspaceLoading,
      workspaceError: workspaceState.userId === currentUserId ? workspaceState.error : null,
      refreshWorkspaces,
      selectWorkspace,
    }}>
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
          router.replace("/workspaces")
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
