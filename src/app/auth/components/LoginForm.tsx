"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { App } from "antd"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginWithEmail, resendVerification } from "@/lib/api/auth"
import { acceptWorkspaceInvitation } from "@/lib/api/workspaces"
import { loginSchema } from "@/lib/validation/auth"
import { authUserChanged } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"
import AuthPageLayout, { AuthCard } from "./AuthPageLayout"
import { AuthError, AuthField, AuthSubmit } from "./AuthFormParts"
import GoogleAuthFlow from "./GoogleAuthFlow"

type LoginValues = { email: string; password: string }

type LoginFormProps = {
  passwordReset?: boolean
  inviteToken?: string
  workspaceJoined?: boolean
}

export default function LoginForm({
  passwordReset = false,
  inviteToken,
  workspaceJoined = false,
}: LoginFormProps) {
  const router = useRouter()
  const { message } = App.useApp()
  const dispatch = useAppDispatch()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  })
  const mutation = useMutation({
    mutationFn: loginWithEmail,
    onSuccess: async ({ user }) => {
      if (!inviteToken) {
        dispatch(authUserChanged(user))
        router.replace("/workspaces")
        return
      }

      // Accept the invitation after authentication; sign-in still succeeds if acceptance fails.
      try {
        await acceptWorkspaceInvitation(inviteToken)
      } catch (error) {
        message.error(error instanceof Error ? error.message : "Invitation could not be accepted.")
      }
      dispatch(authUserChanged(user))
      router.replace("/workspaces")
    },
  })
  const resendMutation = useMutation({
    mutationFn: () => resendVerification(form.getValues("email")),
    onSuccess: ({ message: responseMessage }) => {
      message.success(responseMessage)
    },
  })
  const needsVerification = mutation.error instanceof Error && mutation.error.message.toLowerCase().includes("verify your email")

  return (
    <AuthPageLayout mode="login">
      <AuthCard>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue to your workspace.</p>
      {passwordReset && (
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Password updated. Sign in with your new password.
        </p>
      )}
      <GoogleAuthFlow inviteToken={inviteToken} />
      <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or use email
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
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
        <AuthField
          label="Password"
          name="password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          form={form}
        />
        <div className="-mt-1 text-right"><Link href="/forgot-password" className="text-xs font-semibold text-emerald-800 hover:text-emerald-950">Forgot password?</Link></div>
        {mutation.error && <AuthError error={mutation.error} />}
        {needsVerification && (
          <button
            type="button"
            disabled={resendMutation.isPending}
            onClick={() => resendMutation.mutate()}
            className="w-full text-left text-sm font-semibold text-emerald-800 underline disabled:opacity-60"
          >
            {resendMutation.isPending ? "Sending verification email..." : "Resend verification email"}
          </button>
        )}
        {resendMutation.error && <AuthError error={resendMutation.error} />}
        <AuthSubmit loading={mutation.isPending}>Sign in</AuthSubmit>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New to LetsDo?{" "}
        <Link
          href={inviteToken ? `/signup?inviteToken=${encodeURIComponent(inviteToken)}` : "/signup"}
          className="rounded-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        >
          Create an account
        </Link>
      </p>
      {workspaceJoined && (
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Email verified and workspace invitation accepted. Sign in to continue.
        </p>
      )}
      </AuthCard>
    </AuthPageLayout>
  )
}
