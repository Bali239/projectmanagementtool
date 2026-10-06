"use client"

import { Alert, Empty, Select } from "antd"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"
import { fetchTasks } from "@/lib/api/tasks"
import { searchWorkspaceMembers, type WorkspaceMember } from "@/lib/api/workspaces"
import { taskQueryKeys, workspaceQueryKeys } from "@/lib/queryKeys"
import { getFriendlyErrorMessage } from "@/lib/friendlyError"
import LoadingState from "@/components/LoadingState"
import { useAppSelector } from "@/store/hooks"
import TaskBoard from "./TaskBoard"

export default function DashboardPage() {
  const { user, workspace } = useAuth()
  const searchQuery = useAppSelector((state) => state.tasks.searchQuery)
  const isAdmin = workspace?.role === "admin"
  const [memberSearch, setMemberSearch] = useState("")
  const [debouncedMemberSearch, setDebouncedMemberSearch] = useState("")
  const [selectedMemberId, setSelectedMemberId] = useState<string>()
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null)
  const membersQuery = useQuery({
    queryKey: workspaceQueryKeys.memberSearch(workspace?.id, debouncedMemberSearch),
    queryFn: () => searchWorkspaceMembers(debouncedMemberSearch),
    enabled: !!workspace && isAdmin && debouncedMemberSearch.length >= 2,
    staleTime: 30_000,
  })
  const { data: tasks = [], isPending, isError, error } = useQuery({
    queryKey: taskQueryKeys.list(workspace?.id),
    queryFn: () => fetchTasks(),
    enabled: !!user && !!workspace,
    refetchInterval: 60_000,
  })
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedMemberSearch(memberSearch.trim()), 500)
    return () => window.clearTimeout(timeout)
  }, [memberSearch])

  const members = membersQuery.data ?? []
  const memberOptions = [
    ...(selectedMember && !members.some(({ id }) => id === selectedMember.id)
      ? [{ value: selectedMember.id, label: `${selectedMember.name} (${selectedMember.email})` }]
      : []),
    ...members.map((member) => ({ value: member.id, label: `${member.name} (${member.email})` })),
  ]
  const filteredTasks = tasks.filter((task) =>
    task.title.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())
    && (!selectedMemberId || task.assigneeId === selectedMemberId),
  )

  return (
    <section className="mx-auto flex min-h-full w-full max-w-none flex-col gap-4 sm:gap-6">
      <header className="flex w-full justify-end border-0 bg-transparent p-0 shadow-none">
        <div className="ml-auto flex w-full flex-col justify-end gap-3 sm:w-auto sm:flex-row sm:items-center">
          {isAdmin && <Select
            showSearch
            allowClear
            value={selectedMemberId}
            searchValue={memberSearch}
            onSearch={setMemberSearch}
            onChange={(value: string | undefined) => {
              setSelectedMemberId(value)
              setSelectedMember(value ? members.find((member) => member.id === value) ?? null : null)
              setMemberSearch("")
              setDebouncedMemberSearch("")
            }}
            filterOption={false}
            loading={membersQuery.isFetching}
            options={memberOptions}
            placeholder="Filter by member"
            notFoundContent={debouncedMemberSearch.length < 2 ? "Type at least 2 characters" : "No members found"}
            aria-label="Filter tasks by assigned member"
            className="w-full sm:w-60"
            size="large"
          />}
          <div className="flex min-h-10 items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-2 ring-1 ring-inset ring-slate-200 sm:min-w-32 sm:justify-start">
            <span className="text-sm text-slate-500">{selectedMember ? `Assigned to ${selectedMember.name}` : "On this board"}</span>
            <span className="text-lg font-semibold tabular-nums text-slate-900">{filteredTasks.length}</span>
          </div>
        </div>
      </header>

      {isError ? <Alert type="error" showIcon title="Tasks could not be loaded" description={getFriendlyErrorMessage(error)} /> : null}
      {isPending ? <LoadingState message="Loading your board..." /> : null}
      {!isPending && !isError && filteredTasks.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70">
          <Empty description={selectedMemberId ? "No tasks assigned to this member match the current filters" : searchQuery ? "No tasks match this search" : "Your board is ready for its first task"} />
        </div>
      ) : null}
      {!isPending && !isError && filteredTasks.length > 0 ? <TaskBoard tasks={filteredTasks} canManage={workspace?.role === "admin"} canChangeStatus={!!workspace} /> : null}
    </section>
  )
}
