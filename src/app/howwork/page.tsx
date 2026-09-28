import Link from "next/link"
import { ArrowRight, CalendarDays, Check, CircleDot, ClipboardList, MoveRight } from "lucide-react"
import Navbar from "../Navbar"

const steps = [
  { number: "01", icon: ClipboardList, title: "Capture the work", body: "Create a task with a useful title, a description, and an optional due date or time. Keep the context beside the work." },
  { number: "02", icon: CircleDot, title: "Give it a clear status", body: "Tasks sit in To do, In review, Pending, or Completed. The board makes the current state visible at a glance." },
  { number: "03", icon: MoveRight, title: "Move it forward", body: "Update details as plans change, drag a task to another stage, and use the due date to keep the next milestone in view." },
]

export default function HowWorkPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-950">
      <Navbar />
      <section className="px-5 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 sm:text-sm">How it works</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">A simple flow from idea to done.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">LetsDo gives everyday project work a shared home. Capture the task, make progress visible, and keep the next action close by.</p>
          </div>

          <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
            {steps.map(({ number, icon: Icon, title, body }, index) => (
              <article key={number} className="landing-reveal relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="mb-10 flex items-center justify-between"><span className="text-sm font-semibold text-slate-400">{number}</span><span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-800"><Icon size={22} /></span></div>
                <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
                {index < steps.length - 1 && <ArrowRight aria-hidden="true" className="absolute -right-3 top-1/2 z-10 hidden text-emerald-700 md:block" size={22} />}
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">The purpose</p>
              <h2 className="mt-3 max-w-xl text-2xl font-semibold leading-snug sm:text-3xl">Make the state of work easier to understand.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">A clear board can reduce status checks and scattered notes. LetsDo keeps the task, its progress, and its timing together so people can spend more attention on doing the work.</p>
            </section>
            <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 sm:p-8">
              <CalendarDays className="text-emerald-800" size={22} />
              <h2 className="mt-4 text-xl font-semibold text-slate-900">A useful view, without extra noise.</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">Search for tasks, open a card for its full details, and keep your board focused on what matters now.</p>
              <Link href="/howuse" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950">Read how to use LetsDo <ArrowRight size={15} /></Link>
            </section>
          </div>

          <p className="mt-10 inline-flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-emerald-700" /> Organize tasks, follow progress, and choose the next step.</p>
        </div>
      </section>
    </main>
  )
}
