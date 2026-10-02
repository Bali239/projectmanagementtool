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
        <aside className="landing-reveal relative hidden min-h-[570px] overflow-hidden rounded-[2rem] bg-[#073b35] p-9 text-white shadow-2xl shadow-emerald-950/15 lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div aria-hidden="true" className="absolute -right-20 -top-24 size-80 rounded-full border-[48px] border-emerald-400/10" />
          <div aria-hidden="true" className="absolute -bottom-28 -left-20 size-72 rounded-full bg-emerald-400/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2.5"><span className="grid size-10 place-items-center rounded-xl bg-white/10 text-emerald-100 ring-1 ring-white/15"><PanelsTopLeft size={20} /></span><span className="text-lg font-bold tracking-tight">LetsDo</span></div>
            <p className="mt-16 max-w-md text-4xl font-semibold leading-tight tracking-tight xl:text-[2.75rem]">{message}</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-emerald-100/80">Bring tasks, notes, and due dates into one focused workspace. Keep progress visible and make it easier to know what comes next.</p>
          </div>
          <div className="landing-reveal-delay-1 relative rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-xl backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold text-white">Project board</p><p className="mt-1 text-[10px] text-emerald-100/60">A little more clarity, every day</p></div><span className="grid size-8 place-items-center rounded-lg bg-emerald-300/15 text-emerald-100"><ArrowUpRight size={16} /></span></div>
            <div className="grid grid-cols-3 gap-2">
              {boardColumns.map((column) => <div key={column.title} className="rounded-xl bg-white/[0.08] p-2.5"><div className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${column.color}`} /><span className="truncate text-[9px] font-semibold text-emerald-50/90">{column.title}</span></div><div className="mt-2 rounded-lg border border-white/10 bg-white/[0.07] p-2"><p className="text-[9px] font-medium leading-4 text-white">{column.task}</p><div className="mt-2 h-1 w-2/3 rounded-full bg-white/15" /></div></div>)}
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-emerald-100/70"><Check size={12} /> Tasks stay organized and easy to follow</p>
          </div>
        </aside>
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
