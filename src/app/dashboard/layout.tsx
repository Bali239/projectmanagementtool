import { cookies } from "next/headers"
import type { ReactNode } from "react"
import { TaskWorkspaceProvider } from "./TaskWorkspace"
import DashboardShell from "./DashboardShell"
import { SIDEBAR_PREFERENCE_KEY } from "@/store/uiSlice"
import { AuthGuard } from "@/context/AuthContext"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const savedSidebarOpen = cookieStore.get(SIDEBAR_PREFERENCE_KEY)?.value
  const initialSidebarOpen = savedSidebarOpen === undefined ? true : savedSidebarOpen === "true"

  return (
    <AuthGuard>
      <TaskWorkspaceProvider>
        <DashboardShell initialSidebarOpen={initialSidebarOpen}>{children}</DashboardShell>
      </TaskWorkspaceProvider>
    </AuthGuard>
  )
}
