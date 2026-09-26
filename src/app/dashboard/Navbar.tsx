"use client"

import { Avatar, Button, Dropdown, Input, type MenuProps } from "antd"
import { useMutation } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LayoutDashboard, LogOut, Menu, Plus, Search, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { logout } from "@/lib/firebase/auth"
import { useAppDispatch } from "@/store/hooks"
import { setTaskSearchQuery } from "@/store/tasksSlice"

type NavbarProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onCreateTask: () => void
}

export default function Navbar({ sidebarOpen, onToggleSidebar, onCreateTask }: NavbarProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const signOutMutation = useMutation({ mutationFn: logout, onSuccess: () => router.replace("/login") })

  useEffect(() => {
    const timeout = window.setTimeout(() => dispatch(setTaskSearchQuery(search.trim())), 300)
    return () => window.clearTimeout(timeout)
  }, [dispatch, search])

  const menuItems: MenuProps["items"] = [
    { key: "account", label: <div className="max-w-52"><div className="truncate font-medium">{user?.displayName || "Your account"}</div><div className="truncate text-xs text-slate-500">{user?.email || "Workspace member"}</div></div>, disabled: true },
    { type: "divider" },
    { key: "signout", label: signOutMutation.isPending ? "Signing out..." : "Sign out", icon: <LogOut size={15} />, disabled: signOutMutation.isPending, danger: true },
  ]

  function handleMenuClick({ key }: { key: string }) {
    if (key === "signout") signOutMutation.mutate()
  }

  return (
    <header className="relative z-40 flex h-16 shrink-0 items-center gap-1.5 border-b border-slate-200 bg-white px-2 sm:gap-3 sm:px-5">
      <Button type="text" aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"} icon={sidebarOpen ? <X size={18} /> : <Menu size={18} />} onClick={onToggleSidebar} />
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2 text-slate-900 no-underline">
        <span className="flex size-8 items-center justify-center rounded-md bg-teal-700 text-white"><LayoutDashboard size={17} /></span>
        <span className="hidden text-sm font-semibold sm:inline">JiraTodo</span>
      </Link>
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        allowClear
        prefix={<Search size={15} className="text-slate-400" />}
        placeholder="Search tasks"
        aria-label="Search tasks"
        className="ml-auto min-w-0 max-w-90 flex-1"
      />
      <Button type="primary" icon={<Plus size={16} />} onClick={onCreateTask} className="shrink-0">
        <span className="hidden sm:inline">Create task</span>
      </Button>
      <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={["click"]} placement="bottomRight">
        <button type="button" aria-label="Open profile menu" className="flex size-9 shrink-0 items-center justify-center rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-teal-700">
          <Avatar src={user?.photoURL || undefined} className="bg-teal-700 font-semibold text-white">
            {(user?.displayName || user?.email || "JD").slice(0, 2).toUpperCase()}
          </Avatar>
        </button>
      </Dropdown>
    </header>
  )
}
