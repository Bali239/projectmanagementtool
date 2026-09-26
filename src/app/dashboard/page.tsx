"use client"

import { Alert, Empty, Spin } from "antd"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"
import { fetchTasks } from "@/lib/api/tasks"
import { useAppSelector } from "@/store/hooks"
import TaskBoard from "./TaskBoard"

export default function DashboardPage() {
  const { user } = useAuth()
  const searchQuery = useAppSelector((state) => state.tasks.searchQuery)
  const { data: tasks = [], isPending, isError, error } = useQuery({
    queryKey: ["tasks", user?.uid],
    queryFn: () => fetchTasks(),
    enabled: !!user,
  })
  const filteredTasks = tasks.filter((task) => task.title.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()))

  return (
    <section className="mx-auto flex min-h-full w-full max-w-[1680px] flex-col gap-4 sm:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Project workspace</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Task board</h1>
          <p className="mt-1.5 text-sm text-slate-500">Keep work moving, one clear next step at a time.</p>
        </div>
        <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{filteredTasks.length}</span> {filteredTasks.length === 1 ? "task" : "tasks"}
          {searchQuery && <span className="text-slate-400"> matching “{searchQuery}”</span>}
        </p>
      </header>

      {isError ? <Alert type="error" showIcon message="Tasks could not be loaded" description={error.message} /> : null}
      {isPending ? <div className="flex min-h-72 items-center justify-center"><Spin size="large" /></div> : null}
      {!isPending && !isError && filteredTasks.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70">
          <Empty description={searchQuery ? "No tasks match this search" : "Your board is ready for its first task"} />
        </div>
      ) : null}
      {!isPending && !isError && filteredTasks.length > 0 ? <TaskBoard tasks={filteredTasks} /> : null}
    </section>
  )
}
