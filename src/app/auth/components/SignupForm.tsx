"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { App } from "antd"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupWithEmail } from "@/lib/api/auth"
import { signupSchema } from "@/lib/validation/auth"
import AuthPageLayout, { AuthCard, AuthBrand } from "./AuthPageLayout"
import { AuthError, AuthField, AuthSubmit } from "./AuthFormParts"
import GoogleAuthFlow from "./GoogleAuthFlow"

type SignupValues = { name: string; email: string; password: string; confirmPassword: string }

export default function SignupForm({ inviteToken }: { inviteToken?: string }) {
  const router = useRouter()
  const { message } = App.useApp()
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })
  const mutation = useMutation({
    mutationFn: (values: SignupValues) => signupWithEmail({
      name: values.name,
      email: values.email,
      password: values.password,
      ...(inviteToken ? { inviteToken } : {}),
    }),
    onSuccess: () => {
      message.success({ content: "Verification email sent. Please verify your email before signing in.", duration: 6 })
      router.replace(inviteToken ? `/login?inviteToken=${encodeURIComponent(inviteToken)}` : "/login")
    },
  })

  return <AuthPageLayout mode="signup">
    <AuthCard>
      <AuthBrand />
      <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Create your workspace</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Create your account and start organizing work.</p>
      <GoogleAuthFlow inviteToken={inviteToken} />
      <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />or use email<span className="h-px flex-1 bg-slate-200" /></div>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
        <AuthField label="Name" name="name" placeholder="Alex Morgan" autoComplete="name" form={form} />
        <AuthField label="Email" name="email" type="email" placeholder="you@company.com" autoComplete="email" form={form} />
        <AuthField label="Password" name="password" type="password" placeholder="At least 9 characters" autoComplete="new-password" form={form} />
        <AuthField label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" autoComplete="new-password" form={form} />
        {mutation.error && <AuthError error={mutation.error} />}
        <AuthSubmit loading={mutation.isPending}>Create account</AuthSubmit>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="rounded-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">Sign in</Link></p>
    </AuthCard>
  </AuthPageLayout>
}
