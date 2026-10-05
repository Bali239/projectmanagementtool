import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, FileText, ShieldCheck } from "lucide-react"
import Navbar from "../Navbar"
import PublicFooter from "../Footer"

export const metadata: Metadata = {
  title: "Terms of Service | LetsDo",
  description: "Read the terms for using LetsDo workspaces, task boards, and collaboration features.",
}

const sections = [
  { id: "agreement", title: "1. Agreement to these Terms" },
  { id: "accounts", title: "2. Your account" },
  { id: "workspaces", title: "3. Workspaces and roles" },
  { id: "content", title: "4. Tasks and content" },
  { id: "acceptable-use", title: "5. Acceptable use" },
  { id: "invitations", title: "6. Invitations and service emails" },
  { id: "third-party", title: "7. Third-party services" },
  { id: "availability", title: "8. Availability and changes" },
  { id: "suspension", title: "9. Suspension and ending use" },
  { id: "warranty", title: "10. Service disclaimers" },
  { id: "liability", title: "11. Liability" },
  { id: "updates", title: "12. Updates to these Terms" },
]

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 bg-[#f7faf8] text-slate-950">
        <Navbar />
        <div aria-hidden="true" className="h-[68px]" />

        <section className="relative isolate overflow-clip px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_18%_8%,rgba(16,185,129,0.14),transparent_48%),linear-gradient(to_right,rgba(15,118,110,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,118,110,0.03)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

          <div className="mx-auto max-w-7xl">
            <header className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none mx-auto max-w-3xl text-center">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm sm:text-sm"><FileText size={15} /> Legal information</p>
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">Terms of Service</h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">These terms explain the basic rules for using LetsDo, including accounts, workspaces, task content, and team access.</p>
              <p className="mt-4 text-xs font-medium text-slate-500">Last updated: October 5, 2026</p>
            </header>

            <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-8">
              <aside aria-label="Terms table of contents" className="lg:sticky lg:top-24 lg:self-start">
                <nav aria-label="Terms sections" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">On this page</h2>
                  <ol className="mt-4 space-y-2.5">
                    {sections.map(({ id, title }) => <li key={id}><a href={`#${id}`} className="text-sm leading-5 text-slate-600 transition-colors hover:text-emerald-800 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">{title}</a></li>)}
                  </ol>
                </nav>
              </aside>

              <article className="min-w-0 rounded-2xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-10">
                <div className="mb-8 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-950">
                  <ShieldCheck size={19} className="mt-0.5 shrink-0 text-emerald-800" />
                  <p>Please read these Terms before using LetsDo. They are written in plain language; any rights that cannot be limited under applicable law remain unaffected.</p>
                </div>

                <div className="divide-y divide-slate-200">
                  <section id="agreement" className="scroll-mt-28 py-7 first:pt-0">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">1. Agreement to these Terms</h2>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                      <p>These Terms apply when you access or use LetsDo. By creating an account, accepting a workspace invitation, or using the service, you agree to follow them. If you use LetsDo for an organization, you confirm that you are authorized to accept these Terms for that organization.</p>
                      <p>You must be legally able to enter into a binding agreement where you live. If you do not agree to these Terms, do not use LetsDo.</p>
                    </div>
                  </section>

                  <section id="accounts" className="scroll-mt-28 py-7">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">2. Your account</h2>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                      <p>You can create an account with an email address and password or use Google sign-in. Email sign-up requires you to verify your address before signing in. Keep your account details accurate and take reasonable steps to protect access to your account.</p>
                      <p>You are responsible for keeping your sign-in details private and for activity you authorize through your account. Tell us promptly if you believe someone has accessed it without permission. Do not share account credentials or use another person's account without authorization.</p>
                    </div>
                  </section>

                  <section id="workspaces" className="scroll-mt-28 py-7">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">3. Workspaces and roles</h2>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                      <p>LetsDo organizes work in workspaces. A workspace has its own members, task board, and timezone. The person who creates a workspace becomes its admin. Admins can manage workspace tasks and membership, including sending invitations and removing members.</p>
                      <p>Admins can view all tasks in their workspace. Members can view tasks assigned to them and change those tasks’ statuses. An admin may remove a member; tasks previously assigned to that member become unassigned.</p>
                      <p>If you join a workspace, its admins control membership and can manage workspace content in line with these Terms. Only share information in a workspace that you are authorized to share with its members and admins.</p>
                    </div>
                  </section>

                  <section id="content" className="scroll-mt-28 py-7">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">4. Tasks and content</h2>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                      <p>You keep your rights to the task descriptions, workspace names, images, and other content you submit. You give LetsDo permission to host, store, process, display, and transmit that content only as needed to provide and maintain the service—for example, to show tasks to the appropriate workspace users or send a task-assignment email.</p>
                      <p>You are responsible for having the rights and permissions needed to submit content and for ensuring it is appropriate to share with the relevant workspace. Do not submit content that violates another person’s rights or applicable law.</p>
                      <p>Task due dates and times are interpreted using the timezone configured for that workspace. Task status labels are To do, In review, Pending, and Completed.</p>
                    </div>
                  </section>

                  <section id="acceptable-use" className="scroll-mt-28 py-7">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">5. Acceptable use</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">Use LetsDo lawfully and in a way that respects other users. You may not use the service to harass or deceive people, send unauthorized or abusive invitations, upload malicious code, interfere with the service, attempt to access accounts or workspaces without permission, or violate another person’s rights. Do not probe, disrupt, or overload the service or its infrastructure.</p>
                  </section>

                  <section id="invitations" className="scroll-mt-28 py-7">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">6. Invitations and service emails</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">Workspace admins may invite people by email or import invitations from a CSV file. Invite only people you are authorized to contact. LetsDo may send messages needed to operate the service, such as account verification, password reset, invitation, task-assignment, and security notification emails.</p>
                  </section>

                  <section id="third-party" className="scroll-mt-28 py-7">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">7. Third-party services</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">Some features connect with services operated by others, including Google sign-in and email delivery. Your use of those services may also be subject to the provider's own terms and privacy notices. These Terms continue to apply to your use of LetsDo.</p>
                  </section>

                  <section id="availability" className="scroll-mt-28 py-7">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">8. Availability and changes</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">We may update, change, or temporarily suspend parts of LetsDo to maintain or improve the service, address security concerns, or meet legal requirements. We will try to give reasonable notice of material changes when practical. We do not promise that the service will always be available without interruption.</p>
                  </section>

                  <section id="suspension" className="scroll-mt-28 py-7">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">9. Suspension and ending use</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">You can stop using LetsDo at any time. We may suspend or restrict access where reasonably necessary to address a breach of these Terms, protect users or the service, or comply with law. Where practical, we will provide notice and an opportunity to address the issue. Workspace admins may also manage or remove members from their workspace.</p>
                  </section>

                  <section id="warranty" className="scroll-mt-28 py-7">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">10. Service disclaimers</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">LetsDo relies on internet connections and other services, so interruptions or errors may sometimes occur. We will take reasonable steps to address material service problems. Nothing in these Terms removes consumer guarantees or other rights that cannot legally be excluded or limited.</p>
                  </section>

                  <section id="liability" className="scroll-mt-28 py-7">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">11. Liability</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">Your rights and the responsibilities of LetsDo depend on the circumstances and the laws that apply to you. Nothing in these Terms excludes or restricts a right, remedy, or liability where applicable law does not allow it to be excluded or restricted.</p>
                  </section>

                  <section id="updates" className="scroll-mt-28 py-7 last:pb-0">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">12. Updates to these Terms</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">We may revise these Terms as LetsDo changes or legal requirements evolve. When we do, we will update the date at the top of this page and take reasonable steps to notify users of material changes. The revised Terms apply from the date stated there, subject to any notice or consent required by applicable law.</p>
                  </section>
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">Want to understand how LetsDo works?</p>
                  <Link href="/howwork" className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">How it works <ArrowRight size={15} /></Link>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
