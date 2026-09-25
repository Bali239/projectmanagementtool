"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openCreateTask } from "@/store/tasksSlice"
import { SIDEBAR_PREFERENCE_KEY, setSidebarOpen, sidebarStateHydrated } from "@/store/uiSlice"

export default function DashboardShell({ children, initialSidebarOpen }: { children: ReactNode; initialSidebarOpen: boolean }) {
  const dispatch = useAppDispatch()
  const { sidebarOpen, hydrated } = useAppSelector((state) => state.ui)
  const visibleSidebarOpen = hydrated ? sidebarOpen : initialSidebarOpen

  useEffect(() => {
    dispatch(sidebarStateHydrated(initialSidebarOpen))
  }, [dispatch, initialSidebarOpen])

  function toggleSidebar() {
    const nextOpen = !visibleSidebarOpen
    dispatch(setSidebarOpen(nextOpen))
    document.cookie = `${SIDEBAR_PREFERENCE_KEY}=${nextOpen}; Path=/; Max-Age=31536000; SameSite=Lax`
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <Navbar
        sidebarOpen={visibleSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCreateTask={() => dispatch(openCreateTask("todo"))}
      />
      <div className="flex min-h-0 flex-1">
        {visibleSidebarOpen && <Sidebar />}
        <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
