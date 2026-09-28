"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { ArrowUpRight, Check, PanelsTopLeft } from "lucide-react"
import { useForm, type Resolver } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getAuthErrorMessage, getGoogleCredentialFromError, linkGoogleAccountWithPassword, linkGoogleToEmailAccount, loginWithEmail, loginWithGoogle, sendPasswordReset, signupWithEmail } from "@/lib/firebase/auth"
import type { AuthCredential, User } from "firebase/auth"
import Navbar from "@/app/Navbar"

const emailSchema = z.object({ email: z.string().trim().email("Enter a valid email address.") })
const passwordSchema = z.string()
  .min(9, "Use at least 9 characters.")
  .regex(/[A-Z]/, "Add at least one uppercase letter.")
  .regex(/[0-9]/, "Add at least one number.")
  .regex(/[^A-Za-z0-9]/, "Add at least one special character.")
const loginSchema = emailSchema.extend({ password: z.string().min(1, "Enter your password.") })
const signupSchema = emailSchema.extend({
  password: passwordSchema,
  name: z.string().trim().min(2, "Enter your name.").max(80, "Name is too long."),
  confirmPassword: z.string().min(1, "Confirm your password."),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.", path: ["confirmPassword"],
})
const passwordSetupSchema = z.object({ password: passwordSchema, confirmPassword: z.string().min(1, "Confirm your password.") })
  .refine((values) => values.password === values.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] })
const collisionSchema = z.object({ email: z.string().trim().email("Enter a valid email address."), password: z.string().min(1, "Enter the password for your existing account.") })

type AuthFormProps = { mode: "login" | "signup" | "forgot" }
type AuthFormValues = { name?: string; email: string; password?: string; confirmPassword?: string }
type PasswordValues = { password: string; confirmPassword: string }
type CollisionValues = { email: string; password: string }

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [success, setSuccess] = useState("")
  const [googleUser, setGoogleUser] = useState<User | null>(null)
  const [googleCredential, setGoogleCredential] = useState<AuthCredential | null>(null)
  const [googleEmail, setGoogleEmail] = useState("")
  const isSignup = mode === "signup"
  const isForgot = mode === "forgot"
  const schema = isSignup ? signupSchema : isForgot ? emailSchema : loginSchema
  const form = useForm<AuthFormValues>({ resolver: zodResolver(schema) as Resolver<AuthFormValues>, defaultValues: { name: "", email: "", password: "", confirmPassword: "" } })
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSetupSchema), defaultValues: { password: "", confirmPassword: "" } })
  const collisionForm = useForm<CollisionValues>({ resolver: zodResolver(collisionSchema), defaultValues: { email: "", password: "" } })
  const mutation = useMutation({
    mutationFn: async (values: AuthFormValues) => {
      if (isForgot) return sendPasswordReset(values.email)
      if (isSignup) return signupWithEmail(values.name ?? "", values.email, values.password ?? "")
      return loginWithEmail(values.email, values.password ?? "")
    },
    onSuccess: () => {
      if (isForgot) { setSuccess("Check your inbox for a password reset link."); form.reset({ email: "" }) }
      else router.replace("/dashboard")
    },
  })
  const googleMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: ({ user }) => {
      if (user.providerData.some((provider) => provider.providerId === "password")) router.replace("/dashboard")
      else setGoogleUser(user)
    },
    onError: (error) => {
      const credential = getGoogleCredentialFromError(error)
      if (credential) {
        setGoogleCredential(credential)
        const email = typeof error === "object" && error !== null && "customData" in error
          ? (error.customData as { email?: string } | undefined)?.email ?? ""
          : ""
        setGoogleEmail(email)
        collisionForm.setValue("email", email)
      }
    },
  })
  const passwordMutation = useMutation({
    mutationFn: (values: PasswordValues) => {
      if (!googleUser) throw new Error("Sign in with Google again to continue.")
      return linkGoogleAccountWithPassword(googleUser, values.password)
    },
    onSuccess: () => router.replace("/dashboard"),
  })
  const collisionMutation = useMutation({
    mutationFn: (values: CollisionValues) => {
      if (!googleCredential) throw new Error("Continue with Google again to link your accounts.")
      if (googleEmail && values.email.toLowerCase() !== googleEmail.toLowerCase()) throw new Error("Use the same email address as your Google account.")
      return linkGoogleToEmailAccount(values.email, values.password, googleCredential)
    },
    onSuccess: () => router.replace("/dashboard"),
  })
  const isPending = mutation.isPending || googleMutation.isPending || passwordMutation.isPending || collisionMutation.isPending
  const authError = mutation.error ?? googleMutation.error ?? passwordMutation.error ?? collisionMutation.error

  const title = isSignup ? "Create your workspace" : isForgot ? "Reset your password" : "Welcome back"
  const subtitle = isSignup ? "Start organizing work with your team." : isForgot ? "We will send a reset link to your email." : "Sign in to continue to your projects."

  if (googleUser) return <AuthShell mode={mode}><section className="w-full rounded-2xl border border-white bg-white p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)] sm:p-8">
    <AuthBrand />
    <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950">Add a password</h1><p className="mt-2 text-sm leading-6 text-slate-500">Set a password for {googleUser.email}. You can then sign in with either Google or this email and password.</p>
    <form onSubmit={passwordForm.handleSubmit((values) => passwordMutation.mutate(values))} className="mt-6 space-y-4" noValidate>
      <Field label="Password" name="password" type="password" placeholder="At least 9 characters" form={passwordForm} />
      <Field label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" form={passwordForm} />
      {(authError || passwordForm.formState.errors.root) && <ErrorNotice error={authError} fallback={passwordForm.formState.errors.root?.message} />}
      <button type="submit" disabled={isPending} className="h-11 w-full rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:opacity-60">{isPending ? "Please wait..." : "Save password"}</button>
    </form>
  </section></AuthShell>

  return <AuthShell mode={mode}><section className="w-full rounded-2xl border border-white bg-white p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)] sm:p-8">
    <AuthBrand />
    <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{googleCredential ? "Connect your Google account" : title}</h1>
    <p className="mt-2 text-sm leading-6 text-slate-500">{googleCredential ? "An account already uses this Google email. Sign in with its password to connect Google and email sign-in." : subtitle}</p>

    {!isForgot && !googleCredential && <>
      <button type="button" disabled={isPending} onClick={() => googleMutation.mutate()} className="mt-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:opacity-60"><GoogleIcon />Continue with Google</button>
      <div className="mt-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with email<span className="h-px flex-1 bg-slate-200" /></div>
    </>}

    {googleCredential ? <form onSubmit={collisionForm.handleSubmit((values) => collisionMutation.mutate(values))} className="mt-6 space-y-4" noValidate>
      <Field label="Email" name="email" type="email" placeholder="you@company.com" form={collisionForm} />
      <Field label="Account password" name="password" type="password" placeholder="Your existing password" form={collisionForm} />
      {authError && <ErrorNotice error={authError} />}
      <button type="submit" disabled={isPending} className="h-11 w-full rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60">{isPending ? "Please wait..." : "Connect accounts"}</button>
      <button type="button" className="w-full text-sm font-medium text-emerald-800 hover:text-emerald-950" onClick={() => { setGoogleCredential(null); googleMutation.reset() }}>Back to sign in</button>
    </form> : <form onSubmit={form.handleSubmit((values) => { setSuccess(""); mutation.mutate(values) })} className="mt-4 space-y-4" noValidate>
      {isSignup && <Field label="Name" name="name" type="text" placeholder="Alex Morgan" form={form} />}
      <Field label="Email" name="email" type="email" placeholder="you@company.com" form={form} />
      {!isForgot && <Field label="Password" name="password" type="password" placeholder={isSignup ? "At least 9 characters" : "Your password"} form={form} />}
      {isSignup && <Field label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" form={form} />}
      {mode === "login" && <div className="text-right"><Link href="/forgot-password" className="text-xs font-semibold text-emerald-800 hover:text-emerald-950">Forgot password?</Link></div>}
      {authError && <ErrorNotice error={authError} />}
      {success && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
      <button type="submit" disabled={isPending} className="flex h-11 w-full items-center justify-center rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:opacity-60">{isPending ? "Please wait..." : isSignup ? "Create account" : isForgot ? "Send reset link" : "Sign in"}</button>
    </form>}

    {!googleCredential && <p className="mt-6 text-center text-sm text-slate-500">{isForgot ? <Link href="/login" className="font-semibold text-emerald-800">Back to sign in</Link> : isSignup ? <>Already have an account? <Link href="/login" className="font-semibold text-emerald-800">Sign in</Link></> : <>New to LetsDo? <Link href="/signup" className="font-semibold text-emerald-800">Create an account</Link></>}</p>}
  </section></AuthShell>
}

function AuthShell({ children, mode }: { children: ReactNode; mode: AuthFormProps["mode"] }) {
  const message = mode === "signup" ? "A thoughtful place to get work moving." : mode === "forgot" ? "We’ll help you get back to your work." : "Your work, with a clear next step."

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
              {[{ title: "To do", color: "bg-sky-300", task: "Plan next steps" }, { title: "Pending", color: "bg-amber-300", task: "Build the board" }, { title: "Completed", color: "bg-emerald-300", task: "Share the update" }].map((column) => <div key={column.title} className="rounded-xl bg-white/[0.08] p-2.5"><div className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${column.color}`} /><span className="truncate text-[9px] font-semibold text-emerald-50/90">{column.title}</span></div><div className="mt-2 rounded-lg border border-white/10 bg-white/[0.07] p-2"><p className="text-[9px] font-medium leading-4 text-white">{column.task}</p><div className="mt-2 h-1 w-2/3 rounded-full bg-white/15" /></div></div>)}
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-emerald-100/70"><Check size={12} /> Tasks stay organized and easy to follow</p>
          </div>
        </aside>
        <div className="landing-reveal landing-reveal-delay-1 mx-auto w-full max-w-[460px]">{children}</div>
      </div>
    </main>
  </>
}

function AuthBrand() {
  return <div className="flex items-center gap-2.5">
    <span className="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-900/15"><PanelsTopLeft size={17} /></span>
    <div><p className="text-sm font-bold tracking-tight text-slate-950">LetsDo</p><p className="text-[10px] text-slate-500">Your work, in one place</p></div>
  </div>
}

function GoogleIcon() {
  return <svg aria-hidden="true" viewBox="0 0 48 48" className="size-[18px]">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.75 7.18l7.73 6C44.43 37.93 46.98 31.95 46.98 24.55Z" />
    <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.55 2.56 10.78l7.97-6.19Z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
  </svg>
}

function ErrorNotice({ error, fallback }: { error?: unknown; fallback?: string }) {
  return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error ? getAuthErrorMessage(error) : fallback}</p>
}

function Field<T extends AuthFormValues | PasswordValues | CollisionValues>({ label, name, type, placeholder, form }: { label: string; name: "name" | "email" | "password" | "confirmPassword"; type: string; placeholder: string; form: ReturnType<typeof useForm<T>> }) {
  const error = form.formState.errors[name as keyof typeof form.formState.errors]?.message
  return <label className="block text-sm font-semibold text-slate-700">{label}<input {...form.register(name as never)} type={type} placeholder={placeholder} aria-invalid={!!error} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 aria-[invalid=true]:border-red-400" />{error && <span className="mt-1 block text-xs font-normal text-red-600">{String(error)}</span>}</label>
}
