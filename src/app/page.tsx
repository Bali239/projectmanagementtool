
import Navbar from "./Navbar"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      

      <section className="relative overflow-hidden px-6 pb-28 pt-44">
        <div className="absolute left-1/2 top-24 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Build better. Ship faster.
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Your work, in perfect <span className="text-cyan-400">flow.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            A focused workspace for planning projects, collaborating with your team,
            and turning great ideas into meaningful progress.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
              Start a project
            </button>
            <button className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-white/30 hover:bg-white/5">
              Explore workspace
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto grid max-w-6xl gap-5 px-6 pb-32 md:grid-cols-3">
        {[
          ['01', 'Plan with clarity', 'Keep every task, milestone, and priority visible in one calm workspace.'],
          ['02', 'Collaborate freely', 'Bring your team together with context that keeps everyone moving forward.'],
          ['03', 'Measure momentum', 'Turn progress into insight with a clear view of what comes next.'],
        ].map(([number, title, description]) => (
          <article key={number} className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-cyan-400/40">
            <span className="text-sm text-cyan-400">{number}</span>
            <h2 className="mt-8 text-xl font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-slate-400">{description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
