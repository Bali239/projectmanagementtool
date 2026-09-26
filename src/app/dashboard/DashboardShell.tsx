"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openCreateTask } from "@/store/tasksSlice"
import { SIDEBAR_PREFERENCE_KEY, setSidebarOpen, sidebarStateHydrated } from "@/store/uiSlice"
import CreateTaskModal from "./CreateTaskModal"
import EditTaskModal from "./EditTaskModal"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import TaskDetailModal from "./TaskDetailModal"

export default function DashboardShell({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const { sidebarOpen, hydrated } = useAppSelector((state) => state.ui)

  useEffect(() => {
    const savedPreference = document.cookie.split("; ").find((cookie) => cookie.startsWith(`${SIDEBAR_PREFERENCE_KEY}=`))?.split("=")[1]
    dispatch(sidebarStateHydrated(savedPreference !== "false"))
  }, [dispatch])

  function toggleSidebar() {
    const nextOpen = !sidebarOpen
    dispatch(setSidebarOpen(nextOpen))
    document.cookie = `${SIDEBAR_PREFERENCE_KEY}=${nextOpen}; Path=/; Max-Age=31536000; SameSite=Lax`
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#f4f7f5]">
      <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCreateTask={() => dispatch(openCreateTask("todo"))} />
      <div className="relative flex min-h-0 flex-1 flex-row">
        {sidebarOpen && <>
          <button type="button" aria-label="Close sidebar" onClick={toggleSidebar} className="absolute inset-0 z-20 bg-slate-900/30 md:hidden" />
          <Sidebar onNavigate={() => { if (window.innerWidth < 768) toggleSidebar() }} />
        </>}
        <main className="min-h-0 min-w-0 flex-1 overflow-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
      {hydrated && <>
        <CreateTaskModal />
        <TaskDetailModal />
        <EditTaskModal />
      </>}
    </div>
  )
}
