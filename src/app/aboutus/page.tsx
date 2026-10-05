import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CalendarClock, Check, CircleUserRound, Layers3, ListTodo, MoveRight, UsersRound } from "lucide-react"
import Navbar from "../Navbar"
import PublicFooter from "../Footer"

export const metadata: Metadata = {
  title: "About LetsDo | Task Management",
  description: "Learn about LetsDo, a focused workspace for organizing team tasks, ownership, and progress.",
}

const capabilities = [
  { icon: Layers3, label: "Workspaces", detail: "Keep each team’s tasks and people in their own shared space." },
  { icon: ListTodo, label: "Tasks with context", detail: "Bring a title, formatted description, status, and ownership together." },
  { icon: CalendarClock, label: "Workspace-aware timing", detail: "Add an optional due date and time using the workspace timezone." },
]

const principles = [
  { number: "01", title: "Clarity before complexity", body: "A task should make its next step easier to understand. A clear title, useful description, and visible status keep the essentials close at hand." },
  { number: "02", title: "Shared context, with clear roles", body: "Admins can oversee the workspace and invite teammates. Members can focus on tasks assigned to them and keep their status current." },
  { number: "03", title: "Practical collaboration", body: "Due dates and assignees are optional, so teams can add structure where it helps and keep everyday work straightforward." },
]

export default function AboutUsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 overflow-hidden bg-[#f7faf8] text-slate-950">
        <Navbar />
        <div aria-hidden="true" className="h-[68px]" />

        <section className="relative isolate px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_18%_8%,rgba(16,185,129,0.14),transparent_48%),linear-gradient(to_right,rgba(15,118,110,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,118,110,0.035)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="mx-auto max-w-7xl">
            <header className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none mx-auto max-w-4xl text-center">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm sm:text-sm"><span className="size-2 rounded-full bg-emerald-600" /> About LetsDo</p>
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">Make the work clearer.<br className="hidden sm:block" /> <span className="text-emerald-700">Make the next step easier.</span></h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">LetsDo is a task-management app built around a simple idea: when work, ownership, and progress are easy to see, teams can spend less time piecing things together.</p>
            </header>

            <section aria-labelledby="why-heading" className="mt-14 grid gap-8 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:mt-20 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:p-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Why it exists</p>
                <h2 id="why-heading" className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Good teamwork needs a shared picture of the work.</h2>
              </div>
              <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                <p>When task details live in different places, it can be hard to tell what needs attention, who is responsible, or whether something is finished. LetsDo brings those signals into one workspace board.</p>
                <p>The product is designed to make everyday coordination feel manageable: keep tasks connected to the team doing them, make progress visible through a small set of statuses, and let each workspace choose the amount of scheduling and assignment that suits its work.</p>
              </div>
            </section>

            <section aria-labelledby="snapshot-heading" className="mt-16 sm:mt-20">
              <div className="mb-7 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">The product, at a glance</p>
                <h2 id="snapshot-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">A focused foundation for shared work</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {capabilities.map(({ icon: Icon, label, detail }, index) => (
                  <article key={label} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg sm:p-7" style={{ animationDelay: `${index * 90}ms` }}>
                    <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800 transition duration-200 group-hover:scale-105 group-hover:bg-emerald-100"><Icon size={20} /></span>
                    <h3 className="mt-7 text-lg font-semibold text-slate-900">{label}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
                  </article>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:p-7">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><MoveRight size={20} /></span>
                <p className="text-sm leading-6 text-slate-600"><strong className="text-slate-900">Four clear statuses:</strong> To do, In review, Pending, and Completed. Admins can manage workspace tasks; members see their assigned tasks and can update their status.</p>
              </div>
            </section>

            <section aria-labelledby="principles-heading" className="mt-16 sm:mt-20">
              <div className="mb-7 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">What guides the experience</p><h2 id="principles-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Principles behind a calmer workflow</h2></div>
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {principles.map(({ number, title, body }, index) => (
                  <article key={number} className="animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out motion-reduce:animate-none grid gap-3 py-6 sm:grid-cols-[72px_0.8fr_1.2fr] sm:items-start sm:gap-6 sm:py-8" style={{ animationDelay: `${index * 80}ms` }}>
                    <span className="text-xs font-bold tracking-[0.14em] text-emerald-800">{number}</span><h3 className="text-lg font-semibold text-slate-900">{title}</h3><p className="max-w-2xl text-sm leading-6 text-slate-600">{body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-16 flex flex-col gap-6 rounded-3xl bg-slate-950 p-7 text-white sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div className="max-w-2xl"><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300"><UsersRound size={15} /> Built for shared progress</p><h2 className="mt-3 text-2xl font-semibold sm:text-3xl">See how LetsDo fits into your team’s workflow.</h2><p className="mt-2 text-sm leading-6 text-slate-300">Explore the workspace flow, then decide whether it works for the way your team organizes tasks.</p></div>
              <div className="flex flex-wrap gap-3">
                <Link href="/howwork" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">How it works <ArrowRight size={16} /></Link>
                <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Get started <CircleUserRound size={16} /></Link>
              </div>
            </section>
            <p className="mt-7 inline-flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-emerald-700" /> Simple task details. Shared context. Visible progress.</p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
