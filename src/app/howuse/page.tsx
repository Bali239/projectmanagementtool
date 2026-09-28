import Link from "next/link"
import { ArrowRight, CalendarDays, Eye, GripVertical, Pencil, Plus, Search } from "lucide-react"
import Navbar from "../Navbar"

const instructions = [
    { number: "01", icon: Plus, title: "Create an account", description: "Create an account first to access your workspace. Once you are signed in, choose Create task in the workspace header or the plus button on a column to add your first task." },
  { number: "02", icon: Plus, title: "Add a task", description: "Choose Create task in the workspace header or the plus button on a column. Add a title, then include a description if the task needs more context." },
  { number: "03", icon: CalendarDays, title: "Set status and timing", description: "Choose a status and, when useful, set a due date and time. Tasks appear in the column that matches their status." },
  { number: "04", icon: Eye, title: "Open or edit a task", description: "Use the eye icon to read the full details. Choose the pencil icon to update its title, description, status, or due date. The edit form also lets you delete a task." },
  { number: "05", icon: GripVertical, title: "Move tasks and find work", description: "Drag a task by its grip icon to another status column. Use Search tasks in the header to filter the board by matching tasks." },
]

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-950">
      <Navbar />
      <section className="px-5 pb-16 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 sm:text-sm">How to use LetsDo</p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Everything you need to keep tasks moving.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Start with a task, add the details that help, and keep its status up to date. Here is a quick guide to the workspace.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><Search size={19} /></span>
              <div><p className="text-sm font-semibold text-slate-900">Tip</p><p className="text-xs text-slate-500">Search and scroll keep larger boards manageable.</p></div>
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:mt-16 sm:grid-cols-2">
            {instructions.map(({ number, icon: Icon, title, description }, index) => (
              <article key={number} className="landing-reveal flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:gap-5 sm:p-7" style={{ animationDelay: `${index * 80}ms` }}>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><Icon size={20} /></span>
                <div><p className="text-xs font-semibold text-emerald-800">STEP {number}</p><h2 className="mt-1 text-lg font-semibold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>
              </article>
            ))}
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl bg-emerald-900 px-6 py-8 text-white sm:px-9 sm:py-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">Make it yours</p><h2 className="mt-2 text-2xl font-semibold">Keep the board useful and up to date.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-100">Add enough detail for the next person to understand the task, then move it as the work progresses.</p></div>
              <Link href="/howwork" className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 sm:self-center">See how it works <ArrowRight size={15} /></Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
