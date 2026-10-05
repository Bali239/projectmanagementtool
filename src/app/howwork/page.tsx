import Link from "next/link"
import { ArrowRight, Bell, CalendarClock, Check, ClipboardList, Layers3, MoveRight, UsersRound } from "lucide-react"
import Navbar from "../Navbar"
import PublicFooter from "../Footer"

const steps = [
  { number: "01", icon: Layers3, title: "Start in a workspace", body: "Sign in, then choose one of your workspaces or create one. Each workspace has its own team, task board, and timezone." },
  { number: "02", icon: ClipboardList, title: "Give work enough context", body: "Admins create tasks with a title, formatted description, status, optional due date and time, and an optional workspace-member assignee." },
  { number: "03", icon: MoveRight, title: "Keep the status current", body: "Move tasks across To do, In review, Pending, and Completed. Members can move tasks assigned to them; admins can move any workspace task." },
]

const statuses = [
  { name: "To do", detail: "Work is queued", tone: "border-sky-200 bg-sky-50 text-sky-800", dot: "bg-sky-500" },
  { name: "In review", detail: "Work is being reviewed", tone: "border-violet-200 bg-violet-50 text-violet-800", dot: "bg-violet-500" },
  { name: "Pending", detail: "Work is in progress", tone: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  { name: "Completed", detail: "Work is finished", tone: "border-emerald-200 bg-emerald-50 text-emerald-800", dot: "bg-emerald-600" },
]

export default function HowWorkPage() {
  return (
    <div className="flex min-h-dvh flex-col">
    <main className="flex-1 bg-[#f7faf8] text-slate-950">
      <Navbar />
      <div aria-hidden="true" className="h-[68px]" />
      <section className="relative isolate overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_at_18%_8%,rgba(16,185,129,0.14),transparent_48%),linear-gradient(to_right,rgba(15,118,110,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,118,110,0.035)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="mx-auto max-w-7xl">
          <header className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none mx-auto max-w-4xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm sm:text-sm"><span className="size-2 rounded-full bg-emerald-600" /> The LetsDo workflow</p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">A shared board for <span className="text-emerald-700">work that moves.</span></h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">LetsDo organizes team work inside workspaces. Tasks carry their details, status, timing, and assignee together, so the board reflects what is happening now.</p>
          </header>

          <section aria-labelledby="flow-heading" className="mt-14 sm:mt-20">
            <div className="mb-7 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">From workspace to progress</p><h2 id="flow-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">A clear path for everyday work</h2></div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map(({ number, icon: Icon, title, body }, index) => (
                <article key={number} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg sm:p-7" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[0.14em] text-slate-400">STEP {number}</span><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800 transition duration-200 group-hover:scale-105 group-hover:bg-emerald-100"><Icon size={20} /></span></div>
                  <h3 className="mt-8 text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="statuses-heading" className="mt-16 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:mt-20 sm:p-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">One board, four stages</p><h2 id="statuses-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Statuses show where work stands</h2></div><p className="max-w-md text-sm leading-6 text-slate-600">The same stages are available across the workspace. Move a task when its state changes.</p></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {statuses.map(({ name, detail, tone, dot }, index) => <div key={name} className={`animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none rounded-xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${tone}`} style={{ animationDelay: `${index * 70}ms` }}><p className="flex items-center gap-2 text-sm font-semibold"><span className={`size-2.5 rounded-full ${dot}`} />{name}</p><p className="mt-1.5 pl-[18px] text-xs opacity-80">{detail}</p></div>)}
            </div>
          </section>

          <section className="mt-5 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><span className="grid size-11 place-items-center rounded-xl bg-sky-50 text-sky-800"><UsersRound size={20} /></span><h2 className="mt-5 text-xl font-semibold text-slate-900">A role for each teammate</h2><p className="mt-2 text-sm leading-6 text-slate-600"><strong className="text-slate-800">Admins</strong> can see every workspace task, create and edit tasks, and invite or remove members. <strong className="text-slate-800">Members</strong> see tasks assigned to them and can move those tasks between statuses.</p></article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-800"><CalendarClock size={20} /></span><h2 className="mt-5 text-xl font-semibold text-slate-900">Dates follow the workspace</h2><p className="mt-2 text-sm leading-6 text-slate-600">A task can have an optional due date and time. LetsDo uses the workspace timezone for that schedule; a time is only available after choosing a date.</p></article>
          </section>

          <section className="mt-5 flex flex-col gap-5 rounded-2xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"><div className="max-w-2xl"><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300"><Bell size={14} /> Stay in the loop</p><h2 className="mt-3 text-2xl font-semibold">Assignment can trigger an email update.</h2><p className="mt-2 text-sm leading-6 text-slate-300">When an admin assigns or reassigns a task, LetsDo attempts to email the assignee.</p></div><Link href="/howuse" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">See how to use it <ArrowRight size={16} /></Link></section>

          <p className="mt-8 inline-flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-emerald-700" /> Workspaces, assigned tasks, and clear status changes.</p>
        </div>
      </section>
    </main>
    <PublicFooter />
    </div>
  )
}
