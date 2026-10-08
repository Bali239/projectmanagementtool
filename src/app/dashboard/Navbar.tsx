"use client"

import { App, Avatar, Badge, Button, Drawer, Dropdown, Empty, Input, Popover, type MenuProps } from "antd"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, Building2, Check, ChevronDown, LayoutDashboard, LogOut, Menu, Pencil, Plus, Search, X, Bell } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { logout } from "@/lib/api/auth"
import EditWorkspaceModal from "./EditWorkspaceModal"
import { useAppDispatch } from "@/store/hooks"
import { authUserChanged } from "@/store/authSlice"
import { setTaskSearchQuery } from "@/store/tasksSlice"
import { fetchTaskStatusNotifications } from "@/lib/api/tasks"
import { taskQueryKeys, workspaceQueryKeys } from "@/lib/queryKeys"
import { API_BASE_URL } from "@/lib/api/client"
import { io } from "socket.io-client"

const statusLabels: Record<string, string> = {
  todo: "To do",
  "in-progress": "In progress",
  "in-review": "In review",
  completed: "Completed",
}

const statusStyles: Record<string, string> = {
  todo: "border-slate-200 bg-slate-50 text-slate-600",
  "in-progress": "border-sky-200 bg-sky-50 text-sky-700",
  "in-review": "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
}

type NavbarProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onCreateTask: () => void
}

export default function Navbar({ sidebarOpen, onToggleSidebar, onCreateTask }: NavbarProps) {
  const { modal } = App.useApp()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const { user, workspace, workspaces, refreshWorkspaces, selectWorkspace } = useAuth()
  const notificationsKey = taskQueryKeys.statusNotifications(workspace?.id)
  const notificationsQuery = useQuery({
    queryKey: notificationsKey,
    queryFn: ({ queryKey }) => fetchTaskStatusNotifications(queryKey[1]),
    enabled: workspace?.role === "admin",
    staleTime: 30_000,
  })
  const [search, setSearch] = useState("")
  const [editWorkspaceOpen, setEditWorkspaceOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [seenNotificationState, setSeenNotificationState] = useState<{ workspaceId: string | null; ids: string[] }>({ workspaceId: null, ids: [] })
  const signOutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      dispatch(authUserChanged(null))
      router.replace("/login")
    },
  })

  useEffect(() => {
    const timeout = window.setTimeout(() => dispatch(setTaskSearchQuery(search.trim())), 500)
    return () => window.clearTimeout(timeout)
  }, [dispatch, search])

  useEffect(() => {
    const breakpoint = window.matchMedia("(max-width: 639px)")
    const syncViewport = () => {
      setIsMobile(breakpoint.matches)
      setNotificationsOpen(false)
    }
    syncViewport()
    breakpoint.addEventListener("change", syncViewport)
    return () => breakpoint.removeEventListener("change", syncViewport)
  }, [])

  useEffect(() => {
    if (!user || !workspace) return
    const socket = io(API_BASE_URL.replace(/\/api\/?$/, ""), {
      withCredentials: true,
      auth: { workspaceId: workspace.id },
    })
    const refreshRealtimeData = () => {
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.list(workspace.id) })
      if (workspace.role === "admin") {
        void queryClient.invalidateQueries({ queryKey: taskQueryKeys.statusNotifications(workspace.id) })
      }
    }
    socket.on("connect", refreshRealtimeData)
    socket.on("tasks:changed", refreshRealtimeData)
    socket.on("workspace:members-changed", () => {
      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.members(workspace.id) })
      if (workspace.role === "admin") {
        void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.invitations(workspace.id) })
      }
    })
    if (workspace.role === "admin") {
      socket.on("task-status:changed", () => {
        void queryClient.invalidateQueries({ queryKey: taskQueryKeys.statusNotifications(workspace.id) })
      })
    }
    return () => { socket.disconnect() }
  }, [queryClient, user, workspace?.id, workspace?.role])

  const notifications = notificationsQuery.data ?? []
  const seenNotificationIds = new Set(seenNotificationState.workspaceId === workspace?.id ? seenNotificationState.ids : [])
  const unreadCount = notifications.reduce((count, notification) => count + Number(!seenNotificationIds.has(notification.id)), 0)

  useEffect(() => {
    if (!workspace?.id) {
      setSeenNotificationState({ workspaceId: null, ids: [] })
      return
    }
    try {
      const savedIds: unknown = JSON.parse(window.localStorage.getItem(`letsdo.notifications.seen.${workspace.id}`) || "[]")
      setSeenNotificationState({
        workspaceId: workspace.id,
        ids: Array.isArray(savedIds) ? savedIds.filter((id): id is string => typeof id === "string") : [],
      })
    } catch {
      setSeenNotificationState({ workspaceId: workspace.id, ids: [] })
    }
  }, [workspace?.id])

  useEffect(() => {
    if (!notificationsOpen || !workspace?.id || notificationsQuery.isPending || notificationsQuery.isError) return
    const ids = notifications.map(({ id }) => id)
    setSeenNotificationState({ workspaceId: workspace.id, ids })
    try {
      window.localStorage.setItem(`letsdo.notifications.seen.${workspace.id}`, JSON.stringify(ids))
    } catch {
      // The in-memory state still clears the badge for this session.
    }
  }, [notificationsOpen, notifications, notificationsQuery.isError, notificationsQuery.isPending, workspace?.id])

  const notificationTitle = <div className="flex min-w-0 items-center justify-between gap-4">
    <div className="flex min-w-0 items-center gap-2"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700"><Bell size={15} /></span><span className="truncate text-sm font-semibold text-slate-900">Task activity</span></div>
    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{unreadCount} unread</span>
  </div>
  const notificationContent = <div className="-mx-1 max-h-[min(26rem,calc(100dvh-10rem))] w-full overflow-y-auto overscroll-contain px-1 sm:max-h-[min(26rem,calc(100vh-8rem))] sm:w-[min(24rem,calc(100vw-2rem))]">
    {notificationsQuery.isPending ? <div className="space-y-3 py-2" aria-live="polite" aria-label="Loading notifications">
      {[0, 1, 2].map((item) => <div key={item} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0"><span className="size-8 shrink-0 animate-pulse rounded-full bg-slate-100" /><div className="min-w-0 flex-1 space-y-2 pt-1"><div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" /><div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" /><div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" /></div></div>)}
    </div> : null}
    {notificationsQuery.isError ? <div className="flex flex-col items-center gap-2 py-7 text-center">
      <span className="flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-600"><Bell size={16} /></span>
      <p className="m-0 text-sm font-medium text-slate-800">Couldn’t load activity</p>
      <p className="m-0 text-xs text-slate-500">Check your connection and try again.</p>
      <Button size="small" type="link" onClick={() => void notificationsQuery.refetch()}>Try again</Button>
    </div> : null}
    {!notificationsQuery.isPending && !notificationsQuery.isError && notifications.length === 0 ? <div className="py-5"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-sm text-slate-500">No status changes yet</span>} /></div> : null}
    {!notificationsQuery.isPending && !notificationsQuery.isError && notifications.map((notification) => {
      const fromStatus = statusLabels[notification.fromStatus] || notification.fromStatus
      const toStatus = statusLabels[notification.toStatus] || notification.toStatus
      const date = new Date(notification.createdAt)
      const timeLabel = Number.isNaN(date.getTime()) ? "Time unavailable" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
      return <article key={notification.id} className="group flex gap-3 border-b border-slate-100 py-3 last:border-0">
        <Avatar size={32} className="shrink-0 bg-teal-50 text-xs font-semibold text-teal-800">{(notification.changedBy || "?").trim().slice(0, 1).toUpperCase()}</Avatar>
        <div className="min-w-0 flex-1">
          <p className="m-0 break-words text-[13px] leading-5 text-slate-600"><span className="font-semibold text-slate-900">{notification.changedBy}</span> updated a task</p>
          <p className="mb-2 mt-0.5 break-words text-sm font-semibold leading-5 text-slate-800">{notification.taskTitle}</p>
          <div className="flex flex-wrap items-center gap-1.5" aria-label={`Status changed from ${fromStatus} to ${toStatus}`}>
            <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium leading-4 ${statusStyles[notification.fromStatus] || "border-slate-200 bg-slate-50 text-slate-600"}`}>{fromStatus}</span>
            <ArrowRight size={13} aria-hidden="true" className="shrink-0 text-slate-400" />
            <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium leading-4 ${statusStyles[notification.toStatus] || "border-slate-200 bg-slate-50 text-slate-600"}`}>{toStatus}</span>
          </div>
          <time className="mt-2 block text-[11px] leading-4 text-slate-500" dateTime={notification.createdAt}>{timeLabel}</time>
        </div>
      </article>
    })}
  </div>

  const menuItems: MenuProps["items"] = [
    { key: "account", label: <div className="max-w-52"><div className="truncate font-medium">{user?.displayName || "Your account"}</div><div className="truncate text-xs text-slate-500">{user?.email || "Workspace member"}</div></div>, disabled: true },
    { type: "divider" },
    { key: "signout", label: signOutMutation.isPending ? "Signing out..." : "Sign out", icon: <LogOut size={15} />, disabled: signOutMutation.isPending, danger: true },
  ]
  const workspaceItems: MenuProps["items"] = [
    ...workspaces.map((item) => ({
      key: `workspace:${item.id}`,
      label: <div className="flex max-w-56 items-center justify-between gap-4"><span className="truncate">{item.name}</span><span className="text-xs capitalize text-slate-500">{item.role}</span></div>,
      icon: workspace?.id === item.id ? <Check size={15} /> : <Building2 size={15} />,
    })),
    ...(workspace?.isCreator ? [
      { type: "divider" as const },
      { key: "edit-workspace", label: "Edit workspace", icon: <Pencil size={15} /> },
    ] : []),
    { type: "divider" },
    { key: "all-workspaces", label: "All workspaces" },
  ]

  function handleMenuClick({ key }: { key: string }) {
    if (key === "signout") {
      modal.confirm({
        title: "Are you sure you want to sign out?",
        content: "You will need to sign in again to access your workspaces.",
        okText: "Sign out",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: () => signOutMutation.mutateAsync(),
      })
    }
  }

  function handleWorkspaceMenuClick({ key }: { key: string }) {
    if (key === "edit-workspace") {
      setEditWorkspaceOpen(true)
      return
    }
    if (key === "all-workspaces") {
      router.push("/workspaces")
      return
    }
    if (!key.startsWith("workspace:")) return
    const nextWorkspaceId = key.slice("workspace:".length)
    if (nextWorkspaceId === workspace?.id) return

    // Discard the destination's cached view so the new workspace renders its loading state.
    void queryClient.cancelQueries({ queryKey: taskQueryKeys.list(nextWorkspaceId) })
    void queryClient.cancelQueries({ queryKey: taskQueryKeys.statusNotifications(nextWorkspaceId) })
    void queryClient.cancelQueries({ queryKey: workspaceQueryKeys.members(nextWorkspaceId) })
    void queryClient.cancelQueries({ queryKey: workspaceQueryKeys.invitations(nextWorkspaceId) })
    queryClient.removeQueries({ queryKey: taskQueryKeys.list(nextWorkspaceId), exact: true })
    queryClient.removeQueries({ queryKey: taskQueryKeys.statusNotifications(nextWorkspaceId), exact: true })
    queryClient.removeQueries({ queryKey: ["workspace", nextWorkspaceId] })
    selectWorkspace(nextWorkspaceId)
    router.replace(pathname.startsWith("/dashboard") ? pathname : "/dashboard")
  }

  return (
    <header style={{ left: "50%", width: "100vw", maxWidth: "100vw", transform: "translateX(-50%)" }} className="fixed top-0 z-50 flex h-16 items-center gap-1.5 border-b border-slate-200 bg-white px-2 sm:gap-3 sm:px-5">
      <Button type="text" aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"} icon={sidebarOpen ? <X size={18} /> : <Menu size={18} />} onClick={onToggleSidebar} />
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2 text-slate-900 no-underline">
        <span className="flex size-8 items-center justify-center rounded-md bg-teal-700 text-white"><LayoutDashboard size={17} /></span>
        <span className="hidden text-sm font-semibold sm:inline">LetsDo</span>
      </Link>
      <Dropdown menu={{ items: workspaceItems, onClick: handleWorkspaceMenuClick }} trigger={["click"]}>
        <button type="button" aria-label={`Switch workspace. Current workspace: ${workspace?.name || "none"}`} className="inline-flex min-w-0 max-w-44 items-center gap-1.5 border-l border-slate-200 pl-2 text-sm font-medium text-slate-600 sm:pl-3">
          <Avatar src={workspace?.photoUrl || undefined} shape="square" size={22} className="shrink-0 bg-teal-50 text-teal-800">
            <Building2 size={13} />
          </Avatar>
          <span className="hidden truncate sm:inline">{workspace?.name || "Choose workspace"}</span>
          <ChevronDown size={14} className="shrink-0" />
        </button>
      </Dropdown>
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        allowClear
        prefix={<Search size={15} className="text-slate-400" />}
        placeholder="Search tasks"
        aria-label="Search tasks"
        className="ml-auto min-w-0 max-w-90 flex-1"
      />
      {workspace?.role === "admin" && <Button type="primary" icon={<Plus size={16} />} onClick={onCreateTask} className="shrink-0">
        <span className="hidden sm:inline">Create task</span>
      </Button>}
      {workspace?.role === "admin" && <>
        {isMobile ? <>
          <button type="button" aria-label={`Status notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} onClick={() => setNotificationsOpen(true)} className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-600 outline-none ring-offset-2 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-700">
            <Badge count={unreadCount} overflowCount={9} size="small"><Bell size={19} /></Badge>
          </button>
          <Drawer
            title={notificationTitle}
            placement="bottom"
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            size="min(82dvh, 38rem)"
            style={{ width: "100vw" }}
            styles={{ body: { padding: "12px 16px max(16px, env(safe-area-inset-bottom))", overflow: "hidden" } }}
          >
            {notificationContent}
          </Drawer>
        </> : <Popover
          trigger="click"
          placement="bottomRight"
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
          title={notificationTitle}
          content={notificationContent}
        >
          <button type="button" aria-label={`Status notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-600 outline-none ring-offset-2 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-700">
            <Badge count={unreadCount} overflowCount={9} size="small"><Bell size={19} /></Badge>
          </button>
        </Popover>}
      </>}
      <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={["click"]} placement="bottomRight">
        <button type="button" aria-label="Open profile menu" className="flex size-9 shrink-0 items-center justify-center rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-teal-700">
          <Avatar src={user?.photoURL || undefined} className="bg-teal-700 font-semibold text-white">
            {(user?.displayName || user?.email || "JD").slice(0, 2).toUpperCase()}
          </Avatar>
        </button>
      </Dropdown>
      {workspace && <EditWorkspaceModal
        open={editWorkspaceOpen}
        workspace={workspace}
        onCancel={() => setEditWorkspaceOpen(false)}
        onSaved={async () => {
          await refreshWorkspaces()
          await queryClient.invalidateQueries()
        }}
      />}
    </header>
  )
}
