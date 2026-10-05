"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPassword } from "@/lib/api/auth"
import { resetPasswordSchema } from "@/lib/validation/auth"
import AuthPageLayout, { AuthBrand, AuthCard } from "./AuthPageLayout"
import { AuthError, AuthField, AuthSubmit } from "./AuthFormParts"

type ResetPasswordValues = { email: string; token: string; password: string; confirmPassword: string }

export default function ResetPasswordForm({ email, token }: { email: string; token: string }) {
  const router = useRouter()
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { email, token, password: "", confirmPassword: "" },
  })
  const mutation = useMutation({
    mutationFn: ({ email: accountEmail, token: resetToken, password }: ResetPasswordValues) => resetPassword({ email: accountEmail, token: resetToken, password }),
    onSuccess: () => router.replace("/login?passwordReset=success"),
  })
  const invalidLink = !email || token.length < 32

  return <AuthPageLayout mode="reset">
    <AuthCard>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Choose a new password</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Use at least 9 characters, including uppercase, lowercase, a number, and a special character.</p>
      {invalidLink ? <div className="mt-6 space-y-4"><p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">This reset link is missing information or is invalid.</p><Link href="/forgot-password" className="block text-sm font-semibold text-emerald-800">Request another link</Link></div> : (
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="mt-6 space-y-4" noValidate>
          <input type="hidden" {...form.register("email")} />
          <input type="hidden" {...form.register("token")} />
          <AuthField label="New password" name="password" type="password" placeholder="Create a strong password" autoComplete="new-password" form={form} />
          <AuthField label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" autoComplete="new-password" form={form} />
          {mutation.error && <AuthError error={mutation.error} />}
          <AuthSubmit loading={mutation.isPending}>Update password</AuthSubmit>
        </form>
      )}
    </AuthCard>
  </AuthPageLayout>
}