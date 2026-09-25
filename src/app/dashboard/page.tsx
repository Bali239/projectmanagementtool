"use client"

import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import { useDroppable } from "@dnd-kit/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, Check, Circle, Clock3, Eye, Plus, Sparkles } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openCreateTask, openTaskDetails, type BoardTask, type TaskStatus } from "@/store/tasksSlice"
import { useAuth } from "@/context/AuthContext"
import { fetchTasks, updateTask } from "@/lib/api/tasks"

const columns: { id: TaskStatus; label: string; icon: typeof Circle; tone: string }[] = [
  { id: "todo", label: "To do", icon: Circle, tone: "text-slate-400" },
  { id: "in-progress", label: "In progress", icon: Clock3, tone: "text-blue-500" },
  { id: "in-review", label: "In review", icon: Eye, tone: "text-violet-500" },
  { id: "completed", label: "Completed", icon: Check, tone: "text-emerald-500" },
  { id: "due-date", label: "Due date", icon: CalendarDays, tone: "text-amber-500" },
]

function TaskCard({ task, index }: { task: BoardTask; index: number }) {
  const dispatch = useAppDispatch()
  const { ref, isDragging } = useSortable({
    id: task.id,
    index,
    group: task.status,
    data: { taskId: task.id, status: task.status },
  })

  return (
    <article
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${task.title}`}
      onClick={() => dispatch(openTaskDetails(task.id))}
      onKeyDown={(event) => {
        if (event.key === "Enter") dispatch(openTaskDetails(task.id))
      }}
      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${isDragging ? "opacity-45 ring-2 ring-indigo-300" : ""}`}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500">{task.id.slice(0, 6)}</span>
        <span className="size-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-center text-[9px] font-bold leading-5 text-white" title="Assigned to you">JD</span>
      </div>
      <h3 className="text-sm font-semibold leading-5 text-slate-800">{task.title}</h3>
      {task.description.replace(/<[^>]*>/g, " ").trim() && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">{task.description.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim()}</p>
      )}
      <div className="mt-3 flex min-h-6 items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <span className="text-[10px] font-medium text-slate-400">Task</span>
        {task.dueDate && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500"><CalendarDays className="size-3" />{new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
      </div>
    </article>
  )
}

function BoardColumn({ status, label, icon: Icon, tone, tasks, onAdd, searching }: {
  status: TaskStatus
  label: string
  icon: typeof Circle
  tone: string
  tasks: BoardTask[]
  onAdd: () => void
  searching: boolean
}) {
  const { ref, isDropTarget } = useDroppable({ id: `column-${status}`, data: { status } })

  return (
    <section className="flex w-[268px] shrink-0 flex-col" aria-label={`${label} tasks`}>
      <header className="mb-3 flex h-9 items-center gap-2 px-1">
        <Icon className={`size-[17px] ${tone}`} strokeWidth={2.1} />
        <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{tasks.length}</span>
        <button type="button" onClick={onAdd} aria-label={`Add task to ${label}`} className="ml-auto rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Plus className="size-4" /></button>
      </header>
      <div
        ref={ref}
        className={`flex min-h-[calc(100vh-250px)] flex-1 flex-col gap-2.5 rounded-xl border p-2 transition-colors ${isDropTarget ? "border-indigo-300 bg-indigo-50/70" : "border-slate-200/80 bg-slate-100/70"}`}
      >
        {tasks.map((task, index) => <TaskCard key={task.id} task={task} index={index} />)}
        {tasks.length === 0 && (
          <div className={`flex min-h-24 flex-1 items-center justify-center rounded-lg border border-dashed text-xs transition-colors ${isDropTarget ? "border-indigo-300 text-indigo-500" : "border-slate-300/80 text-slate-400"}`}>
            {searching ? "No matching tasks" : "Drop a task here"}
          </div>
        )}
      </div>
    </section>
  )
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { searchQuery } = useAppSelector((state) => state.tasks)
  const { data: tasks = [], isSuccess: hydrated } = useQuery({
    queryKey: ["tasks", user?.uid, searchQuery],
    queryFn: () => fetchTasks(searchQuery),
    enabled: !!user,
  })
  const moveMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  })
  const searching = !!searchQuery.trim()

  return (
    <div className="mx-auto max-w-[1800px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-indigo-600"><Sparkles className="size-3.5" /> Team workspace</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project board</h1>
          <p className="mt-1 text-sm text-slate-500">Plan, track, and move your work forward.</p>
        </div>
        <button type="button" onClick={() => dispatch(openCreateTask("todo"))} className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><Plus className="size-4" /> Add task</button>
      </div>

      <div className="overflow-x-auto pb-5">
        {!hydrated ? (
          <div className="grid min-w-max grid-cols-5 gap-4">
            {columns.map((column) => <div key={column.id} className="h-72 w-[268px] animate-pulse rounded-xl bg-slate-200/70" />)}
          </div>
        ) : (
          <DragDropProvider onDragEnd={(event) => {
            if (event.canceled) return
            const taskId = event.operation.source?.data.taskId
            const status = event.operation.target?.data.status as TaskStatus | undefined
            const targetTaskId = event.operation.target?.data.taskId
            if (typeof taskId === "string" && status && columns.some((column) => column.id === status)) {
              const task = tasks.find((item) => item.id === taskId)
              if (task) moveMutation.mutate({ ...task, status })
            }
          }}>
            <div className="flex min-w-max gap-4">
              {columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  status={column.id}
                  label={column.label}
                  icon={column.icon}
                  tone={column.tone}
                  tasks={tasks.filter((task) => task.status === column.id)}
                  onAdd={() => dispatch(openCreateTask(column.id))}
                  searching={searching}
                />
              ))}
            </div>
          </DragDropProvider>
        )}
      </div>
    </div>
  )
}
