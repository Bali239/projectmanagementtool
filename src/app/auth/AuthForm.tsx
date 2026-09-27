"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getAuthErrorMessage, getGoogleCredentialFromError, linkGoogleAccountWithPassword, linkGoogleToEmailAccount, loginWithEmail, loginWithGoogle, sendPasswordReset, signupWithEmail } from "@/lib/firebase/auth"
import type { AuthCredential, User } from "firebase/auth"

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

  if (googleUser) return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-5 py-10 text-slate-900"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
    <h1 className="text-2xl font-bold">Add a password</h1><p className="mt-2 text-sm leading-6 text-slate-500">Set a password for {googleUser.email}. You can then sign in with either Google or this email and password.</p>
    <form onSubmit={passwordForm.handleSubmit((values) => passwordMutation.mutate(values))} className="mt-6 space-y-4" noValidate>
      <Field label="Password" name="password" type="password" placeholder="At least 9 characters" form={passwordForm} />
      <Field label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" form={passwordForm} />
      {(authError || passwordForm.formState.errors.root) && <ErrorNotice error={authError} fallback={passwordForm.formState.errors.root?.message} />}
      <button type="submit" disabled={isPending} className="h-11 w-full rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{isPending ? "Please wait..." : "Save password"}</button>
    </form>
  </section></main>

  return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-5 py-10 text-slate-900"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
    <Link href="/" className="text-sm font-bold tracking-tight text-indigo-600">JiraTodo</Link>
    <h1 className="mt-10 text-3xl font-bold tracking-tight">{googleCredential ? "Connect your Google account" : title}</h1>
    <p className="mt-2 text-sm leading-6 text-slate-500">{googleCredential ? "An account already uses this Google email. Sign in with its password to connect Google and email sign-in." : subtitle}</p>

    {!isForgot && !googleCredential && <>
      <button type="button" disabled={isPending} onClick={() => googleMutation.mutate()} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"><span aria-hidden="true" className="text-base font-bold text-blue-600">G</span>Continue with Google</button>
      <div className="mt-4 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
    </>}

    {googleCredential ? <form onSubmit={collisionForm.handleSubmit((values) => collisionMutation.mutate(values))} className="mt-6 space-y-4" noValidate>
      <Field label="Email" name="email" type="email" placeholder="you@company.com" form={collisionForm} />
      <Field label="Account password" name="password" type="password" placeholder="Your existing password" form={collisionForm} />
      {authError && <ErrorNotice error={authError} />}
      <button type="submit" disabled={isPending} className="h-11 w-full rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{isPending ? "Please wait..." : "Connect accounts"}</button>
      <button type="button" className="w-full text-sm text-indigo-600" onClick={() => { setGoogleCredential(null); googleMutation.reset() }}>Back to sign in</button>
    </form> : <form onSubmit={form.handleSubmit((values) => { setSuccess(""); mutation.mutate(values) })} className="mt-4 space-y-4" noValidate>
      {isSignup && <Field label="Name" name="name" type="text" placeholder="Alex Morgan" form={form} />}
      <Field label="Email" name="email" type="email" placeholder="you@company.com" form={form} />
      {!isForgot && <Field label="Password" name="password" type="password" placeholder={isSignup ? "At least 9 characters" : "Your password"} form={form} />}
      {isSignup && <Field label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" form={form} />}
      {mode === "login" && <div className="text-right"><Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</Link></div>}
      {authError && <ErrorNotice error={authError} />}
      {success && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
      <button type="submit" disabled={isPending} className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">{isPending ? "Please wait..." : isSignup ? "Create account" : isForgot ? "Send reset link" : "Sign in"}</button>
    </form>}

    {!googleCredential && <p className="mt-7 text-center text-sm text-slate-500">{isForgot ? <Link href="/login" className="font-semibold text-indigo-600">Back to sign in</Link> : isSignup ? <>Already have an account? <Link href="/login" className="font-semibold text-indigo-600">Sign in</Link></> : <>New to JiraTodo? <Link href="/signup" className="font-semibold text-indigo-600">Create an account</Link></>}</p>}
  </section></main>
}

function ErrorNotice({ error, fallback }: { error?: unknown; fallback?: string }) {
  return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error ? getAuthErrorMessage(error) : fallback}</p>
}

function Field<T extends AuthFormValues | PasswordValues | CollisionValues>({ label, name, type, placeholder, form }: { label: string; name: "name" | "email" | "password" | "confirmPassword"; type: string; placeholder: string; form: ReturnType<typeof useForm<T>> }) {
  const error = form.formState.errors[name as keyof typeof form.formState.errors]?.message
  return <label className="block text-sm font-medium text-slate-700">{label}<input {...form.register(name as never)} type={type} placeholder={placeholder} aria-invalid={!!error} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-[invalid=true]:border-red-400" />{error && <span className="mt-1 block text-xs font-normal text-red-600">{String(error)}</span>}</label>
}
