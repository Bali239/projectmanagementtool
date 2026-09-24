"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Navbar() {
  const [user, setUser] = useState<string | null>(null)

  useEffect(() => {
    setUser(localStorage.getItem("user"))
  }, [])

  return (
      <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 overflow-hidden rounded-full border border-white/15 bg-slate-950/85 shadow-lg shadow-black/30 backdrop-blur-xl backdrop-saturate-150">
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
            <Button variant="default" className="rounded-full p-5" >Get Started</Button>
          ) : (
            <Button variant="outline" className="rounded-full p-5" >Sign In</Button>
          )}
        </div>
      </nav>
    </header>
  )
}
