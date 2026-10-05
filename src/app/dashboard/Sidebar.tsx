"use client"

import { Avatar } from "antd"
import { LayoutDashboard, UsersRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { workspace } = useAuth()
  const active = pathname === "/dashboard"

  return (
    <aside className="fixed top-16 bottom-0 left-0 z-30 flex w-[min(16rem,85vw)] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 shadow-lg md:w-64 md:shadow-none">
      <div className="mb-4 px-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-800">{workspace?.name || "Workspace"}</p>
      </div>
      <nav aria-label="Main navigation">
        <Link href="/dashboard" onClick={onNavigate} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium no-underline transition ${active ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
          <LayoutDashboard size={17} />
          <span>Task board</span>
        </Link>
        <Link href="/dashboard/team" onClick={onNavigate} aria-current={pathname.startsWith("/dashboard/team") ? "page" : undefined} className={`mt-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium no-underline transition ${pathname.startsWith("/dashboard/team") ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
          <UsersRound size={17} />
          <span>Team</span>
        </Link>
      </nav>
      <div className="mt-auto border-t border-slate-100 px-2 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={user?.photoURL || undefined} className="shrink-0 bg-teal-700 font-semibold text-white">
            {(user?.displayName || user?.email || "JD").slice(0, 2).toUpperCase()}
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{user?.displayName || "Your account"}</p>
            <p className="truncate text-xs text-slate-500">{user?.email || "Workspace member"}</p>
            <p className="truncate text-[11px] font-medium capitalize text-teal-700">{workspace?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
