import Navbar from "./Navbar"
import PublicFooter from "./Footer"
import SlicedRevealCarousel from "@/components/pixel-perfect/sliced-reveal-carousel"
import RadialCarousel from "@/components/pixel-perfect/radial-carousel"

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

        </div>
        <SlicedRevealCarousel/>
      </section>

      <section className="border-y border-emerald-100 bg-[#edf5ef] px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 sm:text-sm">Why LetsDo exists</p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">Less time wondering about work. More time moving it forward.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">The purpose is simple: make day-to-day project work easier to understand. Give every task a place, make ownership and timing visible, and help people choose a useful next step without digging through scattered notes.</p>
          </div>
          
          
        </div>
      </section>

    </main>
    {/* <div className="bg-[#edf5ef]">
      <RadialCarousel />
    </div> */}
    <PublicFooter />
    </div>
  )
}
