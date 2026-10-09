"use client"

import { isCancelledError, useQueryClient } from "@tanstack/react-query"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "@/context/AuthContext"
import { taskQueryKeys, workspaceQueryKeys } from "@/lib/queryKeys"
import { API_BASE_URL, apiRequest } from "@/lib/api/client"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL
  || (/^https?:\/\//i.test(API_BASE_URL) ? API_BASE_URL.replace(/\/api\/?$/, "") : null)

const SocketContext = createContext<Socket | null | undefined>(undefined)

function sanitizeSocketDiagnostic(value: unknown, depth = 0): unknown {
  if (typeof value === "string") {
    return value
      .replace(/\b(bearer)\s+\S+/gi, "$1 [REDACTED]")
      .replace(/\b(?:cookie|set-cookie|authorization)\s*:\s*[^\r\n]*/gi, "[REDACTED]")
      .replace(/((?:access|refresh)?_?token|cookie|authorization|password|secret)(["']?\s*[:=]\s*["']?)[^&\s"',}]+/gi, "$1$2[REDACTED]")
      .replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[REDACTED]")
  }
  if (value === null || typeof value !== "object") return value
  if (depth >= 4) return "[Truncated]"
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizeSocketDiagnostic(item, depth + 1))

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !/(?:auth|token|jwt|cookie|credential|secret|password|header)/i.test(key))
      .slice(0, 20)
      .map(([key, item]) => [key, sanitizeSocketDiagnostic(item, depth + 1)]),
  )
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { user, workspace } = useAuth()
  const userId = user?.uid
  const workspaceId = workspace?.id
  const workspaceRole = workspace?.role
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!userId || !workspaceId || !workspaceRole) {
      setSocket(null)
      return
    }
    if (!SOCKET_URL) {
      console.error("Socket.IO is not configured. Set NEXT_PUBLIC_SOCKET_URL to the Render service origin and redeploy the frontend.")
      setSocket(null)
      return
    }
    console.log("[SOCKET] Creating connection", { userId, workspaceId, workspaceRole })
    const client = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      auth: (callback) => {
        void apiRequest<{ token: string }>("/auth/socket-token")
          .then(({ token }) => callback({ workspaceId, token }))
          .catch((error: unknown) => {
            console.error("Could not get a Socket.IO auth token:", error)
            callback({ workspaceId, token: null })
          })
      },
    })
    setSocket(client)
    let activeSocketId: string | undefined
    const connectionDetails = (reason?: string) => ({
      socketId: client.id ?? activeSocketId,
      userId,
      workspaceId,
      workspaceRole,
      ...(reason ? { reason } : {}),
    })
    const handleConnectError = (error: Error & { description?: unknown; context?: unknown }) => {
      console.error("[SOCKET] Connect error", {
        ...connectionDetails(),
        message: sanitizeSocketDiagnostic(error.message),
        description: sanitizeSocketDiagnostic(error.description),
        context: sanitizeSocketDiagnostic(error.context),
      })
    }
    const handleDisconnect = (reason: string) => {
      console.log("[SOCKET] Disconnect", connectionDetails(reason))
    }
    const handleReconnectAttempt = (attempt: number) => {
      console.warn("[SOCKET] Reconnect attempt", { ...connectionDetails(), attempt })
    }
    const handleReconnectError = (error: Error) => {
      console.error("[SOCKET] Reconnect error", {
        ...connectionDetails(),
        message: sanitizeSocketDiagnostic(error.message),
      })
    }
    const handleReconnect = (attempt: number) => {
      console.log("[SOCKET] Reconnected", { ...connectionDetails(), attempt })
    }
    const handleManagerOpen = () => {
      console.log("[SOCKET] Manager opened", connectionDetails())
    }
    const handleManagerClose = (reason: string) => {
      console.warn("[SOCKET] Manager closed", connectionDetails(reason))
    }
    const handleManagerError = (error: Error) => {
      console.error("[SOCKET] Manager error", {
        ...connectionDetails(),
        message: sanitizeSocketDiagnostic(error.message),
      })
    }
    const invalidateRealtimeQuery = (queryKey: readonly unknown[]) =>
      queryClient.invalidateQueries({ queryKey }, { cancelRefetch: false, throwOnError: true })
    const reportRefreshFailure = (error: unknown) => {
      if (!isCancelledError(error)) console.error("[QUERY] Realtime refresh failed:", error)
    }
    const refreshRealtimeData = () => {
      void invalidateRealtimeQuery(taskQueryKeys.list(workspaceId)).catch(reportRefreshFailure)
      if (workspaceRole === "admin") {
        void invalidateRealtimeQuery(taskQueryKeys.statusNotifications(workspaceId)).catch(reportRefreshFailure)
      }
    }
    const handleConnect = () => {
      activeSocketId = client.id
      console.log("[SOCKET] Connected", connectionDetails())
      refreshRealtimeData()
    }
    const handleTasksChanged = () => refreshRealtimeData()
    const handleMembersChanged = () => {
      void invalidateRealtimeQuery(workspaceQueryKeys.members(workspaceId)).catch(reportRefreshFailure)
      if (workspaceRole === "admin") {
        void invalidateRealtimeQuery(workspaceQueryKeys.invitations(workspaceId)).catch(reportRefreshFailure)
      }
    }
    const handleTaskStatusChanged = (
      change: { taskId: string; taskTitle: string; fromStatus: string; toStatus: string },
      acknowledge?: (receipt: { socketId: string | undefined; boardRefreshed: boolean; notificationsRefreshed: boolean }) => void,
    ) => {
      if (workspaceRole !== "admin") return
      console.log("[ADMIN SOCKET] task_status_changed RECEIVED", change)
      const refreshes = [
        invalidateRealtimeQuery(taskQueryKeys.list(workspaceId)),
        invalidateRealtimeQuery(taskQueryKeys.statusNotifications(workspaceId)),
      ]
      void Promise.allSettled(refreshes).then((results) => {
        const boardRefreshed = results[0]?.status === "fulfilled"
        const notificationsRefreshed = results[1]?.status === "fulfilled"
        results.forEach((result) => {
          if (result.status === "rejected") reportRefreshFailure(result.reason)
        })
        acknowledge?.({ socketId: client.id, boardRefreshed, notificationsRefreshed })
      })
    }
    client.on("connect_error", handleConnectError)
    client.on("connect", handleConnect)
    client.on("disconnect", handleDisconnect)
    client.on("tasks:changed", handleTasksChanged)
    client.on("workspace:members-changed", handleMembersChanged)
    client.on("task_status_changed", handleTaskStatusChanged)
    client.io.on("reconnect_attempt", handleReconnectAttempt)
    client.io.on("reconnect_error", handleReconnectError)
    client.io.on("reconnect", handleReconnect)
    client.io.on("open", handleManagerOpen)
    client.io.on("close", handleManagerClose)
    client.io.on("error", handleManagerError)
    client.connect()

    return () => {
      console.log("[SOCKET] Effect cleanup", connectionDetails("React effect cleanup"))
      client.off("connect_error", handleConnectError)
      client.off("connect", handleConnect)
      client.off("disconnect", handleDisconnect)
      client.off("tasks:changed", handleTasksChanged)
      client.off("workspace:members-changed", handleMembersChanged)
      client.off("task_status_changed", handleTaskStatusChanged)
      client.io.off("reconnect_attempt", handleReconnectAttempt)
      client.io.off("reconnect_error", handleReconnectError)
      client.io.off("reconnect", handleReconnect)
      client.io.off("open", handleManagerOpen)
      client.io.off("close", handleManagerClose)
      client.io.off("error", handleManagerError)
      client.disconnect()
      setSocket(null)
    }
  }, [queryClient, userId, workspaceId, workspaceRole])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const socket = useContext(SocketContext)
  if (socket === undefined) throw new Error("useSocket must be used within SocketProvider")
  return socket
}