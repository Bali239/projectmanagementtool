"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getAuthErrorMessage, loginWithEmail, loginWithGoogle, sendPasswordReset, signupWithEmail } from "@/lib/firebase/auth"

const emailSchema = z.object({ email: z.string().trim().email("Enter a valid email address.") })
const loginSchema = emailSchema.extend({ password: z.string().min(6, "Password must be at least 6 characters.") })
const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Enter your name.").max(80, "Name is too long."),
  confirmPassword: z.string().min(6, "Confirm your password."),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})

type AuthFormProps = { mode: "login" | "signup" | "forgot" }
type AuthFormValues = {
  name?: string
  email: string
  password?: string
  confirmPassword?: string
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [success, setSuccess] = useState("")
  const isSignup = mode === "signup"
  const isForgot = mode === "forgot"
  const schema = isSignup ? signupSchema : isForgot ? emailSchema : loginSchema
  const form = useForm<AuthFormValues>({ resolver: zodResolver(schema) as Resolver<AuthFormValues>, defaultValues: { name: "", email: "", password: "", confirmPassword: "" } })
  const mutation = useMutation({
    mutationFn: async (values: AuthFormValues) => {
      if (isForgot) return sendPasswordReset(values.email)
      if (isSignup) return signupWithEmail(values.name ?? "", values.email, values.password ?? "")
      return loginWithEmail(values.email, values.password ?? "")
    },
    onSuccess: () => {
      if (isForgot) {
        setSuccess("Check your inbox for a password reset link.")
        form.reset({ email: "" })
      } else {
        router.replace("/dashboard")
      }
    },
  })
  const googleMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: () => router.replace("/dashboard"),
  })
  const isPending = mutation.isPending || googleMutation.isPending
  const authError = mutation.error ?? googleMutation.error

  const title = isSignup ? "Create your workspace" : isForgot ? "Reset your password" : "Welcome back"
  const subtitle = isSignup ? "Start organizing work with your team." : isForgot ? "We will send a reset link to your email." : "Sign in to continue to your projects."

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-5 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
        <Link href="/" className="text-sm font-bold tracking-tight text-indigo-600">JiraTodo</Link>
        <h1 className="mt-10 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>

        {!isForgot && <>
          <button type="button" disabled={isPending} onClick={() => googleMutation.mutate()} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
            <span aria-hidden="true" className="text-base font-bold text-blue-600">G</span>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
        </>}

        <form onSubmit={form.handleSubmit((values) => { setSuccess(""); mutation.mutate(values) })} className={`${isForgot ? "mt-8" : "mt-4"} space-y-4`} noValidate>
          {isSignup && <Field label="Name" name="name" type="text" placeholder="Alex Morgan" form={form} />}
          <Field label="Email" name="email" type="email" placeholder="you@company.com" form={form} />
          {!isForgot && <Field label="Password" name="password" type="password" placeholder="At least 6 characters" form={form} />}
          {isSignup && <Field label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" form={form} />}

          {mode === "login" && <div className="text-right"><Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</Link></div>}
          {(authError || form.formState.errors.root) && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{getAuthErrorMessage(authError) || form.formState.errors.root?.message}</p>}
          {success && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
          <button type="submit" disabled={isPending} className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isPending ? "Please wait..." : isSignup ? "Create account" : isForgot ? "Send reset link" : "Sign in"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          {isForgot ? <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Back to sign in</Link> : isSignup ? <>Already have an account? <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</Link></> : <>New to JiraTodo? <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">Create an account</Link></>}
        </p>
      </section>
    </main>
  )
}

function Field({ label, name, type, placeholder, form }: { label: string; name: keyof AuthFormValues; type: string; placeholder: string; form: ReturnType<typeof useForm<AuthFormValues>> }) {
  const error = form.formState.errors[name]?.message
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input {...form.register(name)} type={type} placeholder={placeholder} aria-invalid={!!error} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-[invalid=true]:border-red-400" />
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{String(error)}</span>}
    </label>
  )
}