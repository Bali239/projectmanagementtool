"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert, App, Avatar, Button, Dropdown, Empty, Modal, Popconfirm, Tooltip, type MenuProps } from "antd"
import { useRouter } from "next/navigation"
import { Building2, EllipsisVertical, LogOut, Pencil, Plus, Trash2, DoorOpen } from "lucide-react"
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
  const { modal } = App.useApp()
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

  function workspaceActionItems(item: WorkspaceSummary): MenuProps["items"] {
    if (item.isCreator) return [
      { key: "edit", label: "Edit workspace", icon: <Pencil size={15} /> },
      { key: "delete", label: "Delete workspace", danger: true, icon: <Trash2 size={15} /> },
    ]
    if (item.role === "member") return [
      { key: "leave", label: "Leave workspace", danger: true, icon: <DoorOpen size={15} /> },
    ]
    return []
  }

  function handleWorkspaceAction(item: WorkspaceSummary, key: string) {
    if (key === "edit") {
      setEditingWorkspace(item)
      return
    }
    if (key === "delete") {
      modal.confirm({
        title: "Delete this workspace?",
        content: "All tasks, invitations, and memberships in this workspace will be permanently deleted.",
        okText: "Delete workspace",
        okButtonProps: { danger: true, loading: deleteMutation.isPending },
        cancelText: "Cancel",
        onOk: () => deleteMutation.mutateAsync(item.id),
      })
      return
    }
    if (key === "leave") {
      modal.confirm({
        title: "Leave this workspace?",
        content: "You will lose access to its tasks. Tasks assigned to you will become unassigned.",
        okText: "Leave workspace",
        okButtonProps: { danger: true, loading: leaveMutation.isPending },
        cancelText: "Cancel",
        onOk: () => leaveMutation.mutateAsync(item.id),
      })
    }
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
            <span className="hidden max-w-56 truncate text-sm text-slate-600 sm:block">{user?.email || user?.displayName}</span>
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

        <section className="py-5 sm:py-7">
          <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Your workspaces</p>
            </div>
            <Tooltip title={capacityMessage}>
              <Button
                type="primary"
                icon={<Plus size={16} />}
                aria-disabled={createDisabled}
                className={createDisabled ? "w-full cursor-not-allowed opacity-50 sm:w-auto" : "w-full sm:w-auto"}
                onClick={() => {
                  if (createDisabled) return
                  setCreateOpen(true)
                }}
              >
                Create workspace
              </Button>
            </Tooltip>
          </div>

          
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
            {workspaces.map((workspace) => <li
              key={workspace.id}
              role="link"
              tabIndex={0}
              onClick={() => { void openWorkspace(workspace) }}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  void openWorkspace(workspace)
                }
              }}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-colors hover:border-teal-300 hover:bg-teal-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:gap-4 sm:p-5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <span className="shrink-0 rounded-md">
                  <Avatar shape="square" size={44} src={workspace.photoUrl || undefined} className="bg-teal-50 font-semibold text-teal-800 sm:!size-12">
                    {workspace.name.slice(0, 1).toUpperCase()}
                  </Avatar>
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-slate-900">
                    {workspace.name}
                  </h2>
                  <p className="mt-1 text-xs capitalize text-slate-500 sm:text-sm">{workspace.role}</p>
                </div>
              </div>
              <div className="shrink-0" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                <Dropdown
                  trigger={["click"]}
                  placement="bottomRight"
                  menu={{
                    items: workspaceActionItems(workspace),
                    onClick: ({ key, domEvent }) => {
                      domEvent.stopPropagation()
                      handleWorkspaceAction(workspace, key)
                    },
                  }}
                >
                  <Button
                    type="text"
                    shape="circle"
                    aria-label={`More actions for ${workspace.name}`}
                    title="Workspace actions"
                    icon={<EllipsisVertical size={19} />}
                    className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  />
                </Dropdown>
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
