"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openCreateTask } from "@/store/tasksSlice"
import { SIDEBAR_PREFERENCE_KEY, setSidebarOpen, sidebarStateHydrated } from "@/store/uiSlice"
import CreateTaskModal from "./CreateTaskModal"
import EditTaskModal from "./EditTaskModal"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import TaskDetailModal from "./TaskDetailModal"
import LoadingState from "@/components/LoadingState"
import { useAuth } from "@/context/AuthContext"

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { workspace, workspaceLoading } = useAuth()
  const dispatch = useAppDispatch()
  const { sidebarOpen, hydrated } = useAppSelector((state) => state.ui)

  useEffect(() => {
    const savedPreference = document.cookie.split("; ").find((cookie) => cookie.startsWith(`${SIDEBAR_PREFERENCE_KEY}=`))?.split("=")[1]
    dispatch(sidebarStateHydrated(savedPreference !== "false"))
  }, [dispatch])

  useEffect(() => {
    if (!workspaceLoading && !workspace) router.replace("/workspaces")
  }, [router, workspace, workspaceLoading])

  if (workspaceLoading || !workspace) return <LoadingState className="min-h-screen bg-slate-50" message="Loading your workspace..." />

  function toggleSidebar() {
    const nextOpen = !sidebarOpen
    dispatch(setSidebarOpen(nextOpen))
    document.cookie = `${SIDEBAR_PREFERENCE_KEY}=${nextOpen}; Path=/; Max-Age=31536000; SameSite=Lax`
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f7f5]">
      <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCreateTask={() => dispatch(openCreateTask("todo"))} />
      <div aria-hidden="true" className="h-16 shrink-0" />
      <div className="relative flex flex-1 flex-row">
        {sidebarOpen && <>
          <button type="button" aria-label="Close sidebar" onClick={toggleSidebar} className="fixed inset-x-0 top-16 bottom-0 z-20 bg-slate-900/30 md:hidden" />
          <Sidebar onNavigate={() => { if (window.innerWidth < 768) toggleSidebar() }} />
        </>}
        <main className={`min-w-0 flex-1 px-3 py-4 transition-[margin] sm:px-6 sm:py-6 lg:px-8 ${sidebarOpen ? "md:ml-64" : ""}`}>{children}</main>
      </div>
      {hydrated && <>
        <TaskDetailModal />
        {workspace?.role === "admin" && <>
          <CreateTaskModal />
          <EditTaskModal />
        </>}
      </>}
    </div>
  )
}
