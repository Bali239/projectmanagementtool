"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { sendPasswordReset } from "@/lib/firebase/auth"
import AuthPageLayout, { AuthCard, AuthBrand } from "./AuthPageLayout"
import { AuthError, AuthField, AuthSubmit } from "./AuthFormParts"

const resetSchema = z.object({ email: z.string().trim().email("Enter a valid email address.") })
type ResetValues = z.infer<typeof resetSchema>

export default function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false)
  const form = useForm<ResetValues>({ resolver: zodResolver(resetSchema), defaultValues: { email: "" } })
  const mutation = useMutation({
    mutationFn: (values: ResetValues) => sendPasswordReset(values.email),
    onSuccess: () => {
      setSuccess(true)
      form.reset({ email: "" })
    },
  })

  return <AuthPageLayout mode="forgot">
    <AuthCard>
      <AuthBrand />
      <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Reset your password</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">We will send a reset link to your email.</p>
      <form onSubmit={form.handleSubmit((values) => { setSuccess(false); mutation.mutate(values) })} className="mt-6 space-y-4" noValidate>
        <AuthField label="Email" name="email" type="email" placeholder="you@company.com" form={form} />
        {mutation.error && <AuthError error={mutation.error} />}
        {success && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Check your inbox for a password reset link.</p>}
        <AuthSubmit loading={mutation.isPending}>Send reset link</AuthSubmit>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500"><Link href="/login" className="font-semibold text-emerald-800">Back to sign in</Link></p>
    </AuthCard>
  </AuthPageLayout>
}
