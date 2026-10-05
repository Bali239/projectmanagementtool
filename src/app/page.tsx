import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays, Check, ClipboardList, Eye, MoveRight } from "lucide-react"
import dashboardPreview from "./frontdashboard.png"
import Navbar from "./Navbar"
import PublicFooter from "./Footer"

const benefits = [
  { icon: ClipboardList, title: "Keep every task together", text: "Add a clear title, useful notes, and the details your team needs to act." },
  { icon: MoveRight, title: "See work move forward", text: "Organize tasks by status and move them across the board as work changes." },
  { icon: CalendarDays, title: "Keep dates in sight", text: "Add due dates and times so upcoming work stays easy to spot." },
]

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
    <main className="flex-1 overflow-hidden bg-[#f7faf8] text-slate-950">
      <Navbar />
      <div aria-hidden="true" className="h-[68px]" />

      <section className="relative px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.13),transparent_55%),linear-gradient(to_right,rgba(15,118,110,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,118,110,0.035)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm sm:text-sm">
              <span className="size-2 rounded-full bg-emerald-600" /> A calmer way to manage your work
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">Know what needs doing. <span className="text-emerald-700">See what comes next.</span></h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
              LetsDo is a task management workspace that brings your tasks, notes, and due dates into one clear board. Keep projects organized, follow progress, and make the next step easier to see.
            </p>
            
          </div>

          <figure className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none relative mx-auto mt-12 max-w-6xl sm:mt-16" style={{ animationDelay: "110ms" }}>
            <div aria-hidden="true" className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-200/70 via-white to-lime-100/70 blur-xl sm:-inset-7" />
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_28px_80px_-35px_rgba(15,23,42,0.32)] sm:rounded-2xl">
              <Image src={dashboardPreview} alt="LetsDo task board showing tasks grouped into To do, In review, Pending, and Completed columns" priority sizes="(max-width: 768px) 100vw, 1200px" className="h-auto w-full" />
              <div aria-hidden="true" className="absolute left-[4.5%] top-[2%] flex h-[6%] w-[8%] items-center gap-[4%] bg-white">
                <span className="grid size-[24%] shrink-0 place-items-center rounded-[20%] bg-emerald-700 text-white"><Check className="size-[70%]" /></span>
                <span className="whitespace-nowrap text-[clamp(5px,0.75vw,10px)] font-bold text-slate-900">LetsDo</span>
              </div>
            </div>
            <figcaption className="mt-3 text-center text-xs text-slate-500 sm:text-sm">A quick view of tasks, status, notes, and due dates in one workspace.</figcaption>
          </figure>
        </div>
      </section>

      <section className="border-y border-emerald-100 bg-[#edf5ef] px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 sm:text-sm">Why LetsDo exists</p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">Less time wondering about work. More time moving it forward.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">The purpose is simple: make day-to-day project work easier to understand. Give every task a place, make ownership and timing visible, and help people choose a useful next step without digging through scattered notes.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md" style={{ animationDelay: `${index * 90}ms` }}>
                <span className="mb-6 grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><Icon size={20} /></span>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
          
        </div>
      </section>

    </main>
    <PublicFooter />
    </div>
  )
}
