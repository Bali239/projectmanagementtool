"use client"

import { onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { authLoading, authUserChanged, type AuthUser } from "@/store/authSlice"
import { getFirebaseAuth } from "@/lib/firebase/client"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function serializeUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const status = useAppSelector((state) => state.auth.status)

  useEffect(() => {
    dispatch(authLoading())
    return onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      dispatch(authUserChanged(nextUser ? serializeUser(nextUser) : null))
    })
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
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading your workspace...</div>
  }

  return children
}