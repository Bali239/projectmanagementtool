"use client"

import Image from "next/image"
import { Button } from "antd"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function Navbar() {
  const { user, loading } = useAuth()
  const router = useRouter()

  return (
      <header style={{ left: "50%", width: "100vw", maxWidth: "100vw", transform: "translateX(-50%)" }} className="fixed top-0 z-50 overflow-hidden border-b border-white/15 bg-slate-950/85 shadow-lg shadow-black/30 backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex h-16 w-full items-center gap-3 px-4 sm:px-6">
        
        <Link href="/" className="flex shrink-0 items-center rounded-lg transition-opacity hover:opacity-80">
        <Image alt="logo" src="/icon.svg" width={32} height={32} priority />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 overflow-x-auto scrollbar-none text-sm font-medium text-slate-300 md:flex">
         <Link href="/" className="group relative shrink-0 whitespace-nowrap py-2 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100">Home</Link>
          <Link href="/dashboard" className="group relative shrink-0 whitespace-nowrap py-2 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100">Dashboard</Link>
          
        </div> 

        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <Button type="primary" size="large" shape="round" className="px-5" onClick={() => router.push("/dashboard")}>Open workspace</Button>
          ) : (
            <Button size="large" shape="round" className="px-5" disabled={loading} onClick={() => router.push("/login")}>Sign in</Button>
          )}
        </div>
      </nav>
    </header>
  )
}
