import type { ReactNode } from "react"
import { ArrowUpRight, Check, PanelsTopLeft } from "lucide-react"
import Navbar from "@/app/Navbar"

export type AuthMode = "login" | "signup" | "forgot" | "reset" | "verify"

const boardColumns = [
  { title: "To do", color: "bg-sky-300", task: "Plan next steps" },
  { title: "Pending", color: "bg-amber-300", task: "Build the board" },
  { title: "Completed", color: "bg-emerald-300", task: "Share the update" },
]

export default function AuthPageLayout({ children, mode }: { children: ReactNode; mode: AuthMode }) {
  const message = mode === "signup" ? "A thoughtful place to get work moving." : mode === "forgot" || mode === "reset" || mode === "verify" ? "Let’s get you back to your work." : "Your work, with a clear next step."

  return <>
    <Navbar />
    <div aria-hidden="true" className="h-[68px]" />
    <main className="relative isolate flex min-h-[calc(100dvh-68px)] items-center overflow-hidden bg-[#f4f8f6] px-4 py-8 text-slate-900 sm:px-8 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_14%_18%,rgba(16,185,129,0.14),transparent_38%),radial-gradient(ellipse_at_90%_80%,rgba(132,204,22,0.11),transparent_34%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-16 -z-10 size-72 rounded-full bg-emerald-200/30 blur-3xl motion-safe:animate-pulse" />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.86fr)] lg:gap-14">
       
        <div className="landing-reveal landing-reveal-delay-1 mx-auto w-full max-w-[460px]">{children}</div>
      </div>
    </main>
  </>
}

export function AuthCard({ children }: { children: ReactNode }) {
  return <section className="w-full rounded-2xl border border-white bg-white p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)] sm:p-8">{children}</section>
}

export function AuthBrand() {
  return <div className="flex items-center gap-2.5">
    <span className="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-900/15"><PanelsTopLeft size={17} /></span>
    <div><p className="text-sm font-bold tracking-tight text-slate-950">LetsDo</p><p className="text-[10px] text-slate-500">Your work, in one place</p></div>
  </div>
}
