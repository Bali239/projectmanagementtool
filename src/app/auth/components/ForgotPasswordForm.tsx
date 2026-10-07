"use client"

import Link from "next/link"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { requestPasswordReset } from "@/lib/api/auth"
import { forgotPasswordSchema } from "@/lib/validation/auth"
import AuthPageLayout, { AuthCard } from "./AuthPageLayout"
import { AuthError, AuthField, AuthSubmit } from "./AuthFormParts"

type ForgotPasswordValues = { email: string }

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  })
  const mutation = useMutation({
    mutationFn: ({ email }: ForgotPasswordValues) => requestPasswordReset(email),
    onSuccess: () => setSubmitted(true),
  })

  return (
    <AuthPageLayout mode="forgot">
    <AuthCard>
      
      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
        Reset your password
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Enter your account email and we’ll send a reset link.</p>
      <form
        onSubmit={form.handleSubmit((values) => {
          setSubmitted(false)
          mutation.mutate(values)
        })}
        className="mt-6 space-y-4"
        noValidate
      >
        <AuthField
          label="Email"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          form={form}
        />
        {mutation.error && <AuthError error={mutation.error} />}
        {submitted && (
          <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            If an account exists for that email, a reset link will be sent.
          </p>
        )}
        <AuthSubmit loading={mutation.isPending}>Send reset link</AuthSubmit>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link
          href="/login"
          className="rounded-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        >
          Back to sign in
        </Link>
      </p>
    </AuthCard>
    </AuthPageLayout>
  )
}
