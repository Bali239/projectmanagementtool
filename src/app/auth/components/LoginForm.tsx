"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginWithEmail } from "@/lib/firebase/auth"
import AuthPageLayout, { AuthCard, AuthBrand } from "./AuthPageLayout"
import { AuthError, AuthField, AuthSubmit } from "./AuthFormParts"
import GoogleAuthFlow from "./GoogleAuthFlow"

const loginSchema = z.object({ email: z.string().trim().email("Enter a valid email address."), password: z.string().min(1, "Enter your password.") })
type LoginValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } })
  const mutation = useMutation({
    mutationFn: (values: LoginValues) => loginWithEmail(values.email, values.password),
    onSuccess: () => router.replace("/dashboard"),
  })

  return <AuthPageLayout mode="login">
    <AuthCard>
      <AuthBrand />
      <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue to your projects.</p>
      <GoogleAuthFlow />
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="mt-4 space-y-4" noValidate>
        <AuthField label="Email" name="email" type="email" placeholder="you@company.com" form={form} />
        <AuthField label="Password" name="password" type="password" placeholder="Your password" form={form} />
        <div className="-mt-1 text-right"><Link href="/forgot-password" className="text-xs font-semibold text-emerald-800 hover:text-emerald-950">Forgot password?</Link></div>
        {mutation.error && <AuthError error={mutation.error} />}
        <AuthSubmit loading={mutation.isPending}>Sign in</AuthSubmit>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">New to LetsDo? <Link href="/signup" className="font-semibold text-emerald-800">Create an account</Link></p>
    </AuthCard>
  </AuthPageLayout>
}
