"use client"

import { App, Avatar, Button, Dropdown, Input, type MenuProps } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, Check, ChevronDown, LayoutDashboard, LogOut, Menu, Pencil, Plus, Search, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { logout } from "@/lib/api/auth"
import EditWorkspaceModal from "./EditWorkspaceModal"
import { useAppDispatch } from "@/store/hooks"
import { authUserChanged } from "@/store/authSlice"
import { setTaskSearchQuery } from "@/store/tasksSlice"

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
  const [search, setSearch] = useState("")
  const [editWorkspaceOpen, setEditWorkspaceOpen] = useState(false)
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
    selectWorkspace(key.slice("workspace:".length))
    void queryClient.invalidateQueries()
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
