"use client"

import { useState, type ReactNode } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { TaskWorkspaceProvider, useTaskWorkspace } from "./TaskWorkspace"

function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { openCreateTask } = useTaskWorkspace()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} onCreateTask={openCreateTask} />
      <div className="flex min-h-0 flex-1">
        {sidebarOpen && <Sidebar />}
        <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <TaskWorkspaceProvider><DashboardShell>{children}</DashboardShell></TaskWorkspaceProvider>
}
