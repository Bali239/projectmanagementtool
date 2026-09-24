"use client"

import type { ReactNode } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openCreateTask } from "@/store/tasksSlice"
import { setSidebarOpen } from "@/store/uiSlice"

export default function DashboardShell({ children, initialSidebarOpen }: { children: ReactNode; initialSidebarOpen: boolean }) {
  const dispatch = useAppDispatch()
  const { sidebarOpen, hydrated } = useAppSelector((state) => state.ui)
  const visibleSidebarOpen = hydrated ? sidebarOpen : initialSidebarOpen

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <Navbar
        sidebarOpen={visibleSidebarOpen}
        onToggleSidebar={() => dispatch(setSidebarOpen(!visibleSidebarOpen))}
        onCreateTask={() => dispatch(openCreateTask("todo"))}
      />
      <div className="flex min-h-0 flex-1">
        {visibleSidebarOpen && <Sidebar />}
        <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
