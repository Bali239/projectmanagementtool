"use client"

import { Button } from "antd"
import { ArrowUpRight, PanelsTopLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function Navbar() {
  const { user, loading } = useAuth()
  const router = useRouter()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex h-[68px] w-full max-w-7xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="LetsDo home" className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-900/15 transition-transform duration-200 group-hover:-rotate-3">
            <PanelsTopLeft size={18} strokeWidth={2.2} />
          </span>
          <span className="text-[17px] font-bold text-slate-950">LetsDo</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-7 text-sm font-medium text-slate-600 sm:flex">
          <Link href="/" className="transition-colors hover:text-emerald-800">Home</Link>
          <Link href="/howwork" className="transition-colors hover:text-emerald-800">How to use</Link>
          <Link href="/howuse" className="transition-colors hover:text-emerald-800">How to use</Link>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Button
            type="primary"
            size="large"
            shape="round"
            className="!h-10 !px-4 !text-sm !font-semibold shadow-sm sm:!px-5 [&.ant-btn-disabled]:!border-[#16796f] [&.ant-btn-disabled]:!bg-[#16796f] [&.ant-btn-disabled]:!text-white [&.ant-btn-disabled]:!opacity-100"
            disabled={loading}
            onClick={() => router.push(user ? "/dashboard" : "/login")}
          >
            <span className="inline-flex items-center gap-1.5">
              {loading ? "Checking your session..." : user ? "Open workspace" : "Create workspace"}
              
            </span>
          </Button>
        </div>
      </nav>
    </header>
  )
}
