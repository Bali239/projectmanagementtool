"use client"

import Link from "next/link"
import { Alert, Button } from "antd"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import LoadingState from "@/components/LoadingState"
import { acceptWorkspaceInvitation, previewWorkspaceInvitation } from "@/lib/api/workspaces"

export default function InviteAcceptPage({ token }: { token: string }) {
  const router = useRouter()
  const { user, loading, workspaceLoading, refreshWorkspaces } = useAuth()
  const previewQuery = useQuery({
    queryKey: ["workspace", "invitation-preview", token],
    queryFn: () => previewWorkspaceInvitation(token),
    enabled: token.length === 64,
    retry: false,
  })
  const acceptMutation = useMutation({
    mutationFn: () => acceptWorkspaceInvitation(token),
    onSuccess: async () => {
      await refreshWorkspaces()
      router.replace("/workspaces")
    },
  })

  if (loading || workspaceLoading || (token.length === 64 && previewQuery.isPending)) {
    return <LoadingState className="min-h-dvh bg-[#f4f7f5]" message="Checking invitation..." />
  }

  const invitation = previewQuery.data?.invitation
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f4f7f5] px-4 py-10">
      <section className="w-full max-w-xl border-l-4 border-teal-700 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Workspace invitation</p>
        {invitation ? <>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Join {invitation.workspaceName}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Invitation sent by <span className="font-medium text-slate-800">{invitation.inviterEmail || "a workspace admin"}</span>.</p>
          {acceptMutation.error && <Alert className="mt-4" type="error" showIcon title={acceptMutation.error.message} />}
          <div className="mt-7 flex flex-wrap gap-3">
            {user && <Button type="primary" size="large" loading={acceptMutation.isPending} onClick={() => acceptMutation.mutate()}>Accept invitation</Button>}
            {!user && <>
              <Link href={`/login?inviteToken=${encodeURIComponent(token)}`}><Button type="primary" size="large">Sign in to join</Button></Link>
              <Link href={`/signup?inviteToken=${encodeURIComponent(token)}`}><Button size="large">Create account</Button></Link>
            </>}
            
          </div>
        </> : <>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Invitation unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">This link is invalid, expired, or has already been used.</p>
          <Link href="/login" className="mt-6 inline-block"><Button type="primary">Go to sign in</Button></Link>
        </>}
      </section>
    </main>
  )
}
