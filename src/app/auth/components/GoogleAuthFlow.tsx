"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { AuthCredential, User } from "firebase/auth"
import { ArrowLeft } from "lucide-react"
import { getGoogleCredentialFromError, linkGoogleAccountWithPassword, linkGoogleToEmailAccount, loginWithGoogle } from "@/lib/firebase/auth"
import { AuthError, AuthField, AuthSubmit, GoogleButton } from "./AuthFormParts"

const passwordSchema = z.string()
  .min(9, "Use at least 9 characters.")
  .regex(/[A-Z]/, "Add at least one uppercase letter.")
  .regex(/[0-9]/, "Add at least one number.")
  .regex(/[^A-Za-z0-9]/, "Add at least one special character.")
const passwordSetupSchema = z.object({ password: passwordSchema, confirmPassword: z.string().min(1, "Confirm your password.") })
  .refine((values) => values.password === values.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] })
const collisionSchema = z.object({ email: z.string().trim().email("Enter a valid email address."), password: z.string().min(1, "Enter the password for your existing account.") })

type PasswordValues = { password: string; confirmPassword: string }
type CollisionValues = { email: string; password: string }

export default function GoogleAuthFlow({ onActiveChange }: { onActiveChange: (active: boolean) => void }) {
  const router = useRouter()
  const [googleUser, setGoogleUser] = useState<User | null>(null)
  const [googleCredential, setGoogleCredential] = useState<AuthCredential | null>(null)
  const [googleEmail, setGoogleEmail] = useState("")
  const active = !!googleUser || !!googleCredential
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSetupSchema), defaultValues: { password: "", confirmPassword: "" } })
  const collisionForm = useForm<CollisionValues>({ resolver: zodResolver(collisionSchema), defaultValues: { email: "", password: "" } })

  useEffect(() => onActiveChange(active), [active, onActiveChange])

  const googleMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: ({ user }) => {
      if (user.providerData.some((provider) => provider.providerId === "password")) router.replace("/dashboard")
      else setGoogleUser(user)
    },
    onError: (error) => {
      const credential = getGoogleCredentialFromError(error)
      if (!credential) return
      setGoogleCredential(credential)
      const email = typeof error === "object" && error !== null && "customData" in error
        ? (error.customData as { email?: string } | undefined)?.email ?? ""
        : ""
      setGoogleEmail(email)
      collisionForm.setValue("email", email)
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

  function resetFlow() {
    setGoogleUser(null)
    setGoogleCredential(null)
    setGoogleEmail("")
    googleMutation.reset()
    passwordMutation.reset()
    collisionMutation.reset()
    passwordForm.reset()
    collisionForm.reset()
  }

  if (googleUser) return <div className="mt-5 border-t border-slate-100 pt-5">
    <h2 className="text-lg font-semibold text-slate-900">Add a password</h2>
    <p className="mt-1 text-sm leading-6 text-slate-500">Set a password for {googleUser.email}. You can then sign in with Google or email and password.</p>
    <form onSubmit={passwordForm.handleSubmit((values) => passwordMutation.mutate(values))} className="mt-4 space-y-4" noValidate>
      <AuthField label="Password" name="password" type="password" placeholder="At least 9 characters" form={passwordForm} />
      <AuthField label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" form={passwordForm} />
      {(passwordMutation.error || passwordForm.formState.errors.root) && <AuthError error={passwordMutation.error} fallback={passwordForm.formState.errors.root?.message} />}
      <AuthSubmit loading={passwordMutation.isPending}>Save password</AuthSubmit>
      <button type="button" onClick={resetFlow} className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-emerald-800 hover:text-emerald-950"><ArrowLeft size={14} /> Back to sign in</button>
    </form>
  </div>

  if (googleCredential) return <div className="mt-5 border-t border-slate-100 pt-5">
    <h2 className="text-lg font-semibold text-slate-900">Connect your Google account</h2>
    <p className="mt-1 text-sm leading-6 text-slate-500">An account already uses this Google email. Sign in with its password to connect both methods.</p>
    <form onSubmit={collisionForm.handleSubmit((values) => collisionMutation.mutate(values))} className="mt-4 space-y-4" noValidate>
      <AuthField label="Email" name="email" type="email" placeholder="you@company.com" form={collisionForm} />
      <AuthField label="Account password" name="password" type="password" placeholder="Your existing password" form={collisionForm} />
      {collisionMutation.error && <AuthError error={collisionMutation.error} />}
      <AuthSubmit loading={collisionMutation.isPending}>Connect accounts</AuthSubmit>
      <button type="button" onClick={resetFlow} className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-emerald-800 hover:text-emerald-950"><ArrowLeft size={14} /> Back to sign in</button>
    </form>
  </div>

  return <div>
    <GoogleButton onClick={() => googleMutation.mutate()} loading={googleMutation.isPending} />
    <div className="mt-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with email<span className="h-px flex-1 bg-slate-200" /></div>
    {googleMutation.error && <div className="mt-4"><AuthError error={googleMutation.error} /></div>}
  </div>
}
