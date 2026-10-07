"use client"

import { useEffect, useRef, useState } from "react"
import { Alert, App, Avatar, Button, Empty, Input, Popconfirm, Popover, Tag } from "antd"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, MailPlus, ShieldCheck, Upload, UserRoundMinus, UsersRound } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import {
  createWorkspaceInvitation,
  fetchWorkspaceInvitations,
  fetchWorkspaceMembers,
  importWorkspaceInvitations,
  removeWorkspaceMember,
  revokeWorkspaceInvitation,
} from "@/lib/api/workspaces"
import { workspaceQueryKeys } from "@/lib/queryKeys"

export default function TeamPage() {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const { user, workspace } = useAuth()
  const isAdmin = workspace?.role === "admin"
  const [email, setEmail] = useState("")
  const [pendingSearch, setPendingSearch] = useState("")
  const [debouncedPendingSearch, setDebouncedPendingSearch] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  const memberKey = workspaceQueryKeys.members(workspace?.id)
  const invitationKey = workspaceQueryKeys.invitations(workspace?.id)
  const membersQuery = useQuery({
    queryKey: memberKey,
    queryFn: ({ queryKey }) => fetchWorkspaceMembers(queryKey[1]),
    enabled: !!workspace,
  })
  const invitationsQuery = useQuery({
    queryKey: invitationKey,
    queryFn: ({ queryKey }) => fetchWorkspaceInvitations(queryKey[1]),
    enabled: !!workspace && isAdmin,
  })
  const inviteMutation = useMutation({
    mutationFn: createWorkspaceInvitation,
    onSuccess: async () => {
      setEmail("")
      message.success("Invitation sent")
      await queryClient.invalidateQueries({ queryKey: invitationKey })
    },
  })
  const csvMutation = useMutation({
    mutationFn: async (file: File) => importWorkspaceInvitations(await file.text()),
    onSuccess: async (result) => {
      const sent = result.summary.sent ?? 0
      const skipped = result.results.length - sent
      if (sent > 0) {
        message.success(`${sent} invitation${sent === 1 ? "" : "s"} sent${skipped ? `; ${skipped} row${skipped === 1 ? "" : "s"} skipped` : ""}.`)
      } else {
        message.warning("No invitations were sent from this CSV.")
      }
      await queryClient.invalidateQueries({ queryKey: invitationKey })
    },
  })
  const removeMutation = useMutation({
    mutationFn: removeWorkspaceMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: memberKey })
      await queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.current })
      message.success("Member removed")
    },
  })
  const revokeMutation = useMutation({
    mutationFn: revokeWorkspaceInvitation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invitationKey }),
  })
  const mutationError = inviteMutation.error || csvMutation.error || removeMutation.error || revokeMutation.error
  const filteredInvitations = (invitationsQuery.data ?? []).filter((invitation) =>
    invitation.email.toLocaleLowerCase().includes(debouncedPendingSearch.toLocaleLowerCase()),
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedPendingSearch(pendingSearch.trim()), 500)
    return () => window.clearTimeout(timeout)
  }, [pendingSearch])

  function submitInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (email.trim()) inviteMutation.mutate(email.trim())
  }

  async function selectCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (file) csvMutation.mutate(file)
  }

  return (
    <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">{workspace?.name}</p>

          <p className="mt-1 text-sm text-slate-500">People who belong to this workspace.</p>
        </div>
        <Tag color={isAdmin ? "cyan" : "default"} icon={isAdmin ? <ShieldCheck size={13} /> : <UsersRound size={13} />}>
          {isAdmin ? "Admin" : "Member"}
        </Tag>
      </header>

      {mutationError && <Alert type="error" showIcon title={mutationError.message} />}
      {membersQuery.isError && <Alert type="error" showIcon title="Team could not be loaded" description={membersQuery.error.message} />}
      {isAdmin && <section aria-labelledby="invite-heading" className="">
        <h2 id="invite-heading" className="text-base font-semibold text-slate-900">Invite people</h2>
        <p className="mt-1 text-sm text-slate-500">Invite an existing account or send a link to someone new.</p>
        <form onSubmit={submitInvite} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" aria-label="Email address" required className="max-w-lg" />
          <Button type="primary" htmlType="submit" icon={<MailPlus size={15} />} loading={inviteMutation.isPending}>Send invite</Button>
          <Popconfirm
            title="Send invitations from this CSV?"
            description="We’ll read the email column and send an invitation to each eligible address as soon as you import the file."
            okText="Choose CSV"
            cancelText="Cancel"
            disabled={csvMutation.isPending}
            onConfirm={() => fileInput.current?.click()}
          >
            <Button icon={<Upload size={15} />} loading={csvMutation.isPending}>Import CSV</Button>
          </Popconfirm>
          <Popover
            trigger="click"
            placement="bottomRight"
            content={<div className="w-[min(22rem,calc(100vw-2rem))]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">Pending invitations</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs tabular-nums text-slate-600">{invitationsQuery.data?.length ?? 0}</span>
              </div>
              <Input
                size="small"
                allowClear
                value={pendingSearch}
                onChange={(event) => setPendingSearch(event.target.value)}
                placeholder="Search by email"
                aria-label="Search pending invitations by email"
                className="mb-2"
              />
              {invitationsQuery.isError && <Alert className="mb-3" type="error" showIcon title="Invitations could not be loaded" description={invitationsQuery.error.message} />}
              {invitationsQuery.isPending ? <p className="py-5 text-center text-sm text-slate-500">Loading invitations...</p> : filteredInvitations.length ? (
                <ul className="max-h-[min(55vh,24rem)] divide-y divide-slate-100 overflow-y-auto">
                  {filteredInvitations.map((invitation) => <li key={invitation.id} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar size={34} className="shrink-0 bg-slate-200 text-slate-600">{invitation.email.slice(0, 1).toUpperCase()}</Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{invitation.email}</p>
                      <p className="text-xs text-slate-500">Expires {new Date(invitation.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <Popconfirm title="Revoke this invitation?" okText="Revoke" onConfirm={() => revokeMutation.mutate(invitation.id)}>
                      <Button type="text" aria-label={`Revoke invite for ${invitation.email}`} title="Revoke invitation" icon={<UserRoundMinus size={16} />} loading={revokeMutation.isPending && revokeMutation.variables === invitation.id} />
                    </Popconfirm>
                  </li>)}
                </ul>
              ) : invitationsQuery.data?.length ? <p className="py-4 text-center text-sm text-slate-500">No invitations match that email.</p>
                : !invitationsQuery.isError ? <p className="py-4 text-sm text-slate-500">No pending invitations.</p> : null}
            </div>}
          >
            <Button aria-label={`Show ${invitationsQuery.data?.length ?? 0} pending invitations`} icon={<ChevronDown size={15} />}>Pending invitations <span className="ml-1 tabular-nums">{invitationsQuery.data?.length ?? 0}</span></Button>
          </Popover>
          <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={selectCsv} />
        </form>

      </section>}
      <section aria-labelledby="members-heading" className="min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="members-heading" className="text-base font-semibold text-slate-900">Members</h2>
          <span className="text-sm tabular-nums text-slate-500">{membersQuery.data?.length ?? 0}</span>
        </div>
        {membersQuery.isPending ? <p className="py-8 text-sm text-slate-500">Loading team...</p> : membersQuery.data?.length ? (
          <ul className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
            {membersQuery.data.map((member) => (
              <li key={member.id} className="flex min-w-0 items-center gap-3 px-3 py-3 sm:px-4">
                <Avatar src={member.picture || undefined} className="shrink-0 bg-teal-700 font-medium text-white">
                  {(member.name || member.email).slice(0, 2).toUpperCase()}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{member.name}{member.id === user?.uid ? " (you)" : ""}</p>
                  <p className="truncate text-xs text-slate-500">{member.email}</p>
                </div>
                <Tag className="capitalize">{member.role}</Tag>
                {isAdmin && member.role === "member" && (
                  <Popconfirm title="Remove this member?" description="Their existing tasks will become unassigned." okText="Remove" okButtonProps={{ danger: true }} onConfirm={() => removeMutation.mutate(member.id)}>
                    <Button type="text" danger aria-label={`Remove ${member.name}`} title="Remove member" icon={<UserRoundMinus size={16} />} loading={removeMutation.isPending && removeMutation.variables === member.id} />
                  </Popconfirm>
                )}
              </li>
            ))}
          </ul>
        ) : <Empty className="py-8" description="No team members yet" />}
      </section>



    </section>
  )
}
