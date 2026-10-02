"use client"

import Link from "next/link"
import { App, Button } from "antd"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { verifyEmail } from "@/lib/api/auth"
import AuthPageLayout, { AuthBrand, AuthCard } from "./AuthPageLayout"
import { AuthError } from "./AuthFormParts"

export default function VerifyEmailForm({ token }: { token: string }) {
  const router = useRouter()
  const { message } = App.useApp()
  const mutation = useMutation({
    mutationFn: () => verifyEmail(token),
    onSuccess: () => {
      message.success("Email verified. You can now sign in.")
      router.replace("/login")
    },
  })
  const invalidToken = token.length !== 64

  return <AuthPageLayout mode="verify">
    <AuthCard>
      <AuthBrand />
      <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Verify your email</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Confirm your email address to activate your account. You’ll sign in after verification.</p>
      {invalidToken ? <div className="mt-6 space-y-4"><p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">This verification link is missing or invalid.</p><Link href="/signup" className="block text-sm font-semibold text-emerald-800">Create a new account</Link></div> : (
        <div className="mt-6 space-y-4">
          {mutation.error && <AuthError error={mutation.error} />}
          <Button type="primary" size="large" block loading={mutation.isPending} onClick={() => mutation.mutate()}>Verify email address</Button>
          <p className="text-center text-sm text-slate-500"><Link href="/login" className="font-semibold text-emerald-800">Back to sign in</Link></p>
        </div>
      )}
    </AuthCard>
  </AuthPageLayout>
}