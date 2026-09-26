"use client"

import { Avatar } from "antd"
import { LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const active = pathname === "/dashboard"

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5">
      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
      <nav aria-label="Main navigation">
        <Link href="/dashboard" onClick={onNavigate} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium no-underline transition ${active ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
          <LayoutDashboard size={17} />
          <span>Task board</span>
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
          </div>
        </div>
      </div>
    </aside>
  )
}
