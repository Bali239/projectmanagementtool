"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, CheckSquare2, ChevronDown, Home, LayoutDashboard, Plus, Settings2 } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { UserAvatar } from "@/components/UserAvatar"
const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white px-4 py-5 text-slate-700">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-xl px-2 py-1.5 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500">
        
        <Image alt="logo" src="/icon.svg" width={32} height={32} priority />
        
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold tracking-tight text-slate-900">JiraTodo</span>
          <span className="mt-0.5 block text-xs text-slate-500">Project workspace</span>
        </span>
        {/* <ChevronDown className="size-4 text-slate-400" /> */}
      </Link>

      <div className="mb-3 flex items-center justify-between px-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
        <button type="button" aria-label="Create a workspace item" className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <Plus className="size-4" />
        </button> 
      </div>

      <nav aria-label="Main navigation" className="space-y-1">
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`size-[18px] ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} strokeWidth={1.9} />
              <span className="flex-1">{label}</span>
              {active && <span className="size-1.5 rounded-full bg-indigo-600" aria-hidden="true" />}
            </Link>
          )
        })}
      </nav>

      {/* <div className="mt-8 px-2">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Your workspace</p>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-700">JD</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">JiraTodo team</p>
              <p className="mt-0.5 text-xs text-slate-500">Personal workspace</p>
            </div>
            <ArrowUpRight className="size-3.5 text-slate-400" />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-2/3 rounded-full bg-indigo-500" />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Workspace is ready to grow</p>
        </div>
      </div> */}

      <div className="mt-auto space-y-3 pt-8">
        

        <div className="flex items-center gap-3 px-2 pt-4">
          <UserAvatar user={user} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.displayName || "Your account"}</p>
            <p className="truncate text-xs text-slate-500">{user?.email || "Workspace member"}</p>
          </div>
          
        </div>
      </div>
    </aside>
  )
}
