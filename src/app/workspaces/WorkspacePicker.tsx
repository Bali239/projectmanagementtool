"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert, Avatar, Button, Empty, Modal, Popconfirm } from "antd"
import { useRouter } from "next/navigation"
import { Building2, LogOut, Pencil, Plus, Trash2, DoorOpen } from "lucide-react"
import LoadingState from "@/components/LoadingState"
import { useAuth } from "@/context/AuthContext"
import { logout } from "@/lib/api/auth"
import { deleteWorkspace, leaveWorkspace, type WorkspaceSummary } from "@/lib/api/workspaces"
import { authUserChanged } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"
import WorkspaceOnboarding from "@/app/dashboard/WorkspaceOnboarding"
import EditWorkspaceModal from "@/app/dashboard/EditWorkspaceModal"

const inviteMessages: Record<string, string> = {
  invalid: "This invitation could not be accepted. Your workspaces are listed below.",
  "already-member": "You already belong to the invited workspace. Your workspaces are listed below.",
  limit: "You already belong to 5 workspaces. The invitation is still available if a place opens up.",
}

export default function WorkspacePicker({ inviteError }: { inviteError?: string }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { user, workspace, workspaces, workspaceLimits, workspaceLoading, workspaceError, refreshWorkspaces, selectWorkspace } = useAuth()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceSummary | null>(null)
  const signOutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      selectWorkspace(null)
      dispatch(authUserChanged(null))
      router.replace("/login")
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: async (_, deletedWorkspaceId) => {
      if (workspace?.id === deletedWorkspaceId) selectWorkspace(null)
      await queryClient.invalidateQueries()
      await refreshWorkspaces()
    },
  })
  const leaveMutation = useMutation({
    mutationFn: (workspaceId: string) => leaveWorkspace(workspaceId),
    onSuccess: async (_, leftWorkspaceId) => {
      if (workspace?.id === leftWorkspaceId) selectWorkspace(null)
      await queryClient.invalidateQueries()
      await refreshWorkspaces()
    },
  })

  if (workspaceLoading) return <LoadingState className="min-h-screen bg-[#f4f7f5]" message="Loading your workspaces..." />

  const createdLimitReached = !!workspaceLimits && workspaceLimits.createdCount >= workspaceLimits.createdLimit
  const membershipLimitReached = !!workspaceLimits && workspaceLimits.membershipCount >= workspaceLimits.membershipLimit
  const createDisabled = createdLimitReached || membershipLimitReached
  const capacityMessage = createdLimitReached
    ? `You have reached the limit of ${workspaceLimits?.createdLimit} workspaces you can create.`
    : membershipLimitReached
      ? `You already belong to ${workspaceLimits?.membershipLimit} workspaces.`
      : null

  async function openWorkspace(workspace: WorkspaceSummary) {
    selectWorkspace(workspace.id)
    await queryClient.invalidateQueries()
    router.replace("/dashboard")
  }

  async function handleWorkspaceCreated(workspace: WorkspaceSummary) {
    await refreshWorkspaces()
    selectWorkspace(workspace.id)
    setCreateOpen(false)
    router.replace("/dashboard")
  }

  return (
    <main className="min-h-dvh bg-[#f4f7f5] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2.5 text-slate-900">
            <span className="grid size-9 place-items-center rounded-md bg-teal-700 text-white"><Building2 size={18} /></span>
            <span className="text-base font-semibold">LetsDo</span>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden max-w-56 truncate text-sm text-slate-600 sm:block">{user?.displayName || user?.email}</span>
            <Popconfirm
              title="Are you sure you want to sign out?"
              description="You will need to sign in again to access your workspaces."
              okText="Sign out"
              okButtonProps={{ danger: true, loading: signOutMutation.isPending }}
              cancelButtonProps={{ disabled: signOutMutation.isPending }}
              onConfirm={() => signOutMutation.mutateAsync()}
            >
              <Button aria-label="Sign out" icon={<LogOut size={16} />} loading={signOutMutation.isPending}>
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </Popconfirm>
          </div>
        </header>

        <section className="py-8 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Your workspaces</p>
              <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Choose a workspace</h1>
              <p className="mt-2 text-sm text-slate-600">Open a space you belong to, or create one of your own.</p>
            </div>
            <Button type="primary" icon={<Plus size={16} />} disabled={createDisabled} onClick={() => setCreateOpen(true)}>
              Create workspace
            </Button>
          </div>

          {/* {workspaceLimits && <p className="mt-5 text-sm text-slate-500">
            Created {workspaceLimits.createdCount} of {workspaceLimits.createdLimit} · Member of {workspaceLimits.membershipCount} of {workspaceLimits.membershipLimit}
          </p>} */}
          {capacityMessage && <Alert className="mt-4" type="info" showIcon title={capacityMessage} />}
          {inviteError && inviteMessages[inviteError] && <Alert className="mt-4" type={inviteError === "limit" ? "warning" : "info"} showIcon title={inviteMessages[inviteError]} />}
          {deleteMutation.error && <Alert className="mt-4" type="error" showIcon title={deleteMutation.error.message} />}
          {leaveMutation.error && <Alert className="mt-4" type="error" showIcon title={leaveMutation.error.message} />}
          {workspaceError && <Alert
            className="mt-4"
            type="error"
            showIcon
            message="Workspaces could not be loaded"
            description={workspaceError}
            action={<Button size="small" onClick={() => { void refreshWorkspaces().catch(() => null) }}>Retry</Button>}
          />}

          {workspaces.length ? <ul className="mt-7 space-y-3">
            {workspaces.map((workspace) => <li key={workspace.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm transition-colors hover:border-teal-300 hover:bg-teal-50/30 sm:px-5 sm:py-5">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label={`Open ${workspace.name} workspace`}
                  onClick={() => { void openWorkspace(workspace) }}
                  className="shrink-0 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                >
                  <Avatar shape="square" size={48} src={workspace.photoUrl || undefined} className="bg-teal-50 font-semibold text-teal-800">
                    {workspace.name.slice(0, 1).toUpperCase()}
                  </Avatar>
                </button>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-slate-900">
                    <button
                      type="button"
                      onClick={() => { void openWorkspace(workspace) }}
                      className="max-w-full cursor-pointer truncate rounded-sm text-left hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                    >
                      {workspace.name}
                    </button>
                  </h2>
                  <p className="mt-1 text-sm capitalize text-slate-500">{workspace.role}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {workspace.isCreator && <>
                  <Button icon={<Pencil size={15} />} onClick={() => setEditingWorkspace(workspace)}>Edit</Button>
                  <Popconfirm
                    title="Delete this workspace?"
                    description="All tasks, invitations, and memberships in this workspace will be permanently deleted."
                    okText="Delete workspace"
                    okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
                    cancelButtonProps={{ disabled: deleteMutation.isPending }}
                    onConfirm={() => deleteMutation.mutate(workspace.id)}
                  >
                    <Button danger icon={<Trash2 size={15} />} loading={deleteMutation.isPending}>Delete</Button>
                  </Popconfirm>
                </>}
                {workspace.role === "member" && <Popconfirm
                  title="Leave this workspace?"
                  description="You will lose access to its tasks. Tasks assigned to you will become unassigned."
                  okText="Leave workspace"
                  okButtonProps={{ danger: true, loading: leaveMutation.isPending }}
                  cancelButtonProps={{ disabled: leaveMutation.isPending }}
                  onConfirm={() => leaveMutation.mutate(workspace.id)}
                >
                  <Button danger icon={<DoorOpen size={15} />} loading={leaveMutation.isPending}>Leave</Button>
                </Popconfirm>}
              </div>
            </li>)}
          </ul> : !workspaceError ? <div className="mt-12 border-y border-slate-200 py-12">
            <Empty description="You do not belong to a workspace yet" />
          </div> : null}
        </section>
      </div>

      <Modal open={createOpen} footer={null} onCancel={() => setCreateOpen(false)} destroyOnHidden>
        <WorkspaceOnboarding onCreated={handleWorkspaceCreated} onCancel={() => setCreateOpen(false)} />
      </Modal>
      {editingWorkspace && <EditWorkspaceModal
        open
        workspace={editingWorkspace}
        onCancel={() => setEditingWorkspace(null)}
        onSaved={async () => {
          await refreshWorkspaces()
          await queryClient.invalidateQueries()
        }}
      />}
    </main>
  )
}
