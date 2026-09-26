import type { ReactNode } from "react"
import { AuthGuard } from "@/context/AuthContext"
import DashboardShell from "./DashboardShell"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  )
}