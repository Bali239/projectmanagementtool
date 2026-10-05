import Link from "next/link"
import { ArrowDown, ArrowRight, CalendarDays, Check, ClipboardList, Eye, FileText, GripVertical, Plus, Search, ShieldCheck, UsersRound } from "lucide-react"
import Navbar from "../Navbar"
import PublicFooter from "../Footer"

const instructions = [
  { number: "01", icon: Plus, title: "Create a task (admins)", description: "Choose Create task in the header or the plus button on a status column. The column button starts the new task in that status. Add a title; a description is optional." },
  { number: "02", icon: CalendarDays, title: "Add timing and ownership", description: "Choose an optional due date and time, then assign the task to a workspace member if useful. Due times use the workspace timezone and require a due date." },
  { number: "03", icon: GripVertical, title: "Move work between stages", description: "Use the grip handle on a task card to drag it to To do, In review, Pending, or Completed. Members can change status for tasks assigned to them." },
  { number: "04", icon: Eye, title: "Review or edit details", description: "On wider screens, use the eye control to read a task and the pencil control to edit it (admins only). Admins can also delete tasks from the edit form." },
  { number: "05", icon: Search, title: "Search the board", description: "Enter a phrase in Search tasks to filter by task title. The search does not look through descriptions. Admins search all workspace tasks; members search their assigned tasks." },
]

export default function HowToUsePage() {
  return (
    <div className="flex min-h-dvh flex-col">
    <main className="flex-1 bg-[#f7faf8] text-slate-950">
      <Navbar />
      <div aria-hidden="true" className="h-[68px]" />
      <section className="relative isolate overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_at_86%_10%,rgba(16,185,129,0.13),transparent_45%),linear-gradient(to_right,rgba(15,118,110,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,118,110,0.03)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="mx-auto max-w-7xl">
          <header className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none mx-auto max-w-4xl text-center">
            <div><p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm sm:text-sm"><span className="size-2 rounded-full bg-emerald-600" /> Your workspace, step by step</p><h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">From task details to <span className="text-emerald-700">the next move.</span></h1><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">A practical guide to creating, assigning, finding, and updating work in LetsDo—with the permissions each workspace role has.</p></div>
            <a href="#quick-start" className="group mt-6 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800 transition group-hover:bg-emerald-100"><ArrowDown size={19} /></span><span><span className="block text-sm font-semibold text-slate-900">Jump to quick start</span><span className="mt-0.5 block text-xs text-slate-500">Five steps for the task board</span></span></a>
          </header>

          <section id="quick-start" aria-labelledby="quick-start-heading" className="mt-14 scroll-mt-24 sm:mt-20">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Quick start</p><h2 id="quick-start-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">The task board, in five steps</h2></div><span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">For admins and members</span></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {instructions.map(({ number, icon: Icon, title, description }, index) => (
                <article key={number} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg sm:flex-col sm:p-6" style={{ animationDelay: `${index * 80}ms` }}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800 transition duration-200 group-hover:scale-105 group-hover:bg-emerald-100"><Icon size={20} /></span>
                  <div><p className="text-xs font-bold tracking-[0.14em] text-emerald-800">STEP {number}</p><h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="task-fields-heading" className="mt-16 grid gap-5 lg:mt-20 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><span className="grid size-11 place-items-center rounded-xl bg-white/10 text-emerald-300"><ClipboardList size={20} /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Task anatomy</p><h2 id="task-fields-heading" className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">Keep the useful details close to the work.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Admins can update these details at any time. Assignments must be to someone in the same workspace.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">01 / Title</span><p className="mt-2 text-sm leading-6 text-slate-600">A required, concise name that appears on the board and powers search.</p></article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-800"><FileText size={14} />02 / Description</span><p className="mt-2 text-sm leading-6 text-slate-600">Optional formatted context, including headings, emphasis, links, and lists.</p></article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">03 / Status</span><p className="mt-2 text-sm leading-6 text-slate-600">To do, In review, Pending, or Completed. New tasks can start in any of these stages.</p></article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">04 / Due &amp; assignee</span><p className="mt-2 text-sm leading-6 text-slate-600">Both are optional. Due time needs a date; the assignee must be a workspace member.</p></article>
            </div>
          </section>

          <section aria-labelledby="roles-heading" className="mt-5">
            <h2 id="roles-heading" className="sr-only">Workspace roles and permissions</h2>
            <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-7"><span className="grid size-10 place-items-center rounded-xl bg-white text-emerald-800 shadow-sm"><ShieldCheck size={19} /></span><h2 className="mt-4 text-lg font-semibold text-slate-900">Workspace admin</h2><p className="mt-2 text-sm leading-6 text-slate-600">Can see all workspace tasks, create/edit/delete tasks, invite people by email or CSV, revoke pending invites, and remove members. Removing a member leaves their existing tasks unassigned.</p></article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"><span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-800"><UsersRound size={19} /></span><h2 className="mt-4 text-lg font-semibold text-slate-900">Workspace member</h2><p className="mt-2 text-sm leading-6 text-slate-600">Can see tasks assigned to them and move those tasks across the status columns. Task editing and invitations are admin-only.</p></article>
            </div>
          </section>

          <section className="mt-5 flex flex-col gap-5 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Keep exploring</p><h2 className="mt-2 text-xl font-semibold text-slate-900">See how workspace tasks fit together.</h2><p className="mt-2 text-sm leading-6 text-slate-600">Learn about the workflow, statuses, roles, and due dates.</p></div><Link href="/howwork" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">How it works <ArrowRight size={15} /></Link></section>
          <p className="mt-8 inline-flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-emerald-700" /> Clear titles, current statuses, and workspace-aware timing.</p>
        </div>
      </section>
    </main>
    <PublicFooter />
    </div>
  )
}
