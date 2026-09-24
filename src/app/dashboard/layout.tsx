"use client"

import { useState, type ReactNode } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="flex min-h-[calc(100vh-68px)]">
        {sidebarOpen && <Sidebar />}
        <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
