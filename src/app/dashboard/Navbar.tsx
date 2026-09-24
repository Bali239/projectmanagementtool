"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Command,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react"

type DashNavProps = {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  onCreateTask: () => void
}

type MenuName = "create" | "settings" | "account" | null

export default function Navbar({ onToggleSidebar, sidebarOpen, onCreateTask }: DashNavProps) {
  const [openMenu, setOpenMenu] = useState<MenuName>(null)
  const [search, setSearch] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenMenu(null)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null)
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const toggleMenu = (menu: Exclude<MenuName, null>) => setOpenMenu((current) => current === menu ? null : menu)

  return (
    <header className="sticky top-0 z-40 flex h-[68px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={sidebarOpen}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {sidebarOpen ? <X className="size-[18px]" /> : <LayoutDashboard className="size-[18px]" />}
      </button>

      <Link href="/dashboard" className="flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        <Image src="/icon.svg" alt="JiraTodo" width={29} height={29} priority />
        <span className="hidden text-[15px] font-bold tracking-tight text-slate-900 sm:inline">JiraTodo</span>
      </Link>

      <div className="relative ml-auto hidden w-full max-w-[420px] md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          aria-label="Search workspace"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
        <kbd className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
          <Command className="size-3" /> K
        </kbd>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ml-0" ref={menuRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("create")}
            aria-expanded={openMenu === "create"}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Create</span>
          </button>
          {openMenu === "create" && (
            <div className="absolute right-0 top-11 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
              <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Create new</p>
              <button type="button" onClick={() => { setOpenMenu(null); onCreateTask() }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                <span className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600"><Check className="size-4" /></span>
                Task <span className="ml-auto text-xs text-slate-400">T</span>
              </button>
              <button type="button" onClick={() => setOpenMenu(null)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                <span className="flex size-7 items-center justify-center rounded-md bg-amber-50 text-amber-600"><LayoutDashboard className="size-4" /></span>
                Project
              </button>
            </div>
          )}
        </div>

        <button type="button" aria-label="Notifications" className="hidden size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex">
          <Bell className="size-[18px]" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("settings")}
            aria-label="Settings menu"
            aria-expanded={openMenu === "settings"}
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <SlidersHorizontal className="size-[18px]" />
          </button>
          {openMenu === "settings" && (
            <div className="absolute right-0 top-11 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
              <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Preferences</p>
              <button type="button" onClick={() => setOpenMenu(null)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Settings className="size-4 text-slate-400" /> Workspace settings</button>
              <button type="button" onClick={() => setOpenMenu(null)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><CircleHelp className="size-4 text-slate-400" /> Help and support</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("account")}
            aria-label="Account menu"
            aria-expanded={openMenu === "account"}
            className="ml-1 flex h-9 items-center gap-2 rounded-full p-0.5 pr-1.5 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white ring-2 ring-white">JD</span>
            <ChevronDown className="hidden size-3.5 text-slate-400 sm:block" />
          </button>
          {openMenu === "account" && (
            <div className="absolute right-0 top-11 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-800">Your account</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">Workspace member</p>
              </div>
              <button type="button" onClick={() => setOpenMenu(null)} className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><UserRound className="size-4 text-slate-400" /> Profile</button>
              <button type="button" onClick={() => setOpenMenu(null)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><LogOut className="size-4 text-slate-400" /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
