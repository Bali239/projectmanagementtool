"use client"

import { DragDropProvider, PointerSensor } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import { useDroppable } from "@dnd-kit/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, Check, Circle, Clock3, Eye, GripVertical, Pencil, Plus, Sparkles } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openCreateTask, openTaskDetails, type BoardTask, type TaskStatus } from "@/store/tasksSlice"
import { useAuth } from "@/context/AuthContext"
import { fetchTasks, updateTask } from "@/lib/api/tasks"
import { formatTaskDueDate } from "@/lib/formatTaskDueDate"

const columns: { id: TaskStatus; label: string; icon: typeof Circle; tone: string }[] = [
  { id: "todo", label: "To do", icon: Circle, tone: "text-slate-400" },
  { id: "in-progress", label: "In progress", icon: Clock3, tone: "text-blue-500" },
  { id: "in-review", label: "In review", icon: Eye, tone: "text-violet-500" },
  { id: "completed", label: "Completed", icon: Check, tone: "text-emerald-500" },
]

const statusLabels = Object.fromEntries(columns.map(({ id, label }) => [id, label])) as Record<TaskStatus, string>

function descriptionPreview(html: string) {
  if (!html) return ""

  const decodeCodePoint = (value: string, radix = 10) => {
    const codePoint = parseInt(value, radix)
    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : " "
  }

  const text = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/(?:li)\s*>/gi, "")
    .replace(/<h[1-6]\b[^>]*>/gi, "\n")
    .replace(/<\/(?:h[1-6])\s*>/gi, "\n")
    .replace(/<\/(?:p|div|blockquote|ul|ol)\s*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, value: string) => decodeCodePoint(value))
    .replace(/&#x([\da-f]+);/gi, (_, value: string) => decodeCodePoint(value, 16))
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return text
}

function TaskCard({ task, index }: { task: BoardTask; index: number }) {
  const dispatch = useAppDispatch()
  const dueLabel = formatTaskDueDate(task.dueDate, task.dueTime, "compact")
  const preview = descriptionPreview(task.description)
  const createdLabel = task.createdAt && !Number.isNaN(new Date(task.createdAt).getTime())
    ? new Date(task.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null
  const { ref, handleRef, isDragging } = useSortable({
    id: task.id,
    index,
    group: task.status,
    data: { taskId: task.id, status: task.status },
  })

  return (
    <article
      ref={ref}
      className={`group rounded-xl border border-slate-200 border-l-[3px] border-l-indigo-400 bg-white p-3.5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-indigo-200 hover:border-l-indigo-500 hover:shadow-md ${isDragging ? "opacity-45 ring-2 ring-indigo-300" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-slate-50 px-1.5 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200/80">
          <span className={`size-1.5 rounded-full ${task.status === "completed" ? "bg-emerald-500" : task.status === "in-progress" ? "bg-blue-500" : task.status === "in-review" ? "bg-violet-500" : "bg-slate-400"}`} />
          {statusLabels[task.status]}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            ref={handleRef}
            type="button"
            aria-label={`Drag ${task.title}`}
            title="Drag task"
            className="cursor-grab rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing"
          ><GripVertical className="size-4" /></button>
          <button
            type="button"
            aria-label={`Open details for ${task.title}`}
            title="Open task details"
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            onClick={() => dispatch(openTaskDetails(task.id))}
            className="rounded-md p-1 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          ><Pencil className="size-3.5" /></button>
        </div>
      </div>
      <h3 title={task.title} className="line-clamp-2 break-words text-[14px] font-semibold leading-[1.4] text-slate-800 group-hover:text-indigo-800">{task.title}</h3>
      {preview && (
        <p onPointerDown={(event) => event.stopPropagation()} className="mt-1.5 max-h-24 touch-pan-y overflow-y-auto overscroll-contain whitespace-pre-line break-words pr-1 text-[12px] leading-[1.55] text-slate-600">{preview}</p>
      )}
      <div className="mt-3 flex min-h-6 flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-t border-slate-100 pt-2.5">
        {dueLabel && <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-1 text-[10px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200/80"><CalendarDays className="size-3" />{dueLabel}</span>}
        {createdLabel && <span className="text-[10px] text-slate-400">Created {createdLabel}</span>}
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
    <section className="flex h-full w-[268px] shrink-0 flex-col" aria-label={`${label} tasks`}>
      <header className="mb-3 flex h-9 items-center gap-2 px-1">
        <Icon className={`size-[17px] ${tone}`} strokeWidth={2.1} />
        <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{tasks.length}</span>
        <button type="button" onClick={onAdd} aria-label={`Add task to ${label}`} className="ml-auto rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Plus className="size-4" /></button>
      </header>
      <div
        ref={ref}
        className={`flex min-h-0 flex-1 touch-pan-y flex-col gap-2.5 overflow-y-auto overscroll-contain rounded-xl border p-2 transition-colors ${isDropTarget ? "border-indigo-300 bg-indigo-50/70" : "border-slate-200/80 bg-slate-100/70"}`}
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

      <div className="h-[calc(100dvh-250px)] min-h-[320px] overflow-x-auto overflow-y-hidden pb-2">
        {!hydrated ? (
            <div className="grid h-full min-w-max grid-cols-4 gap-4">
            {columns.map((column) => <div key={column.id} className="h-72 w-[268px] animate-pulse rounded-xl bg-slate-200/70" />)}
          </div>
        ) : (
          <DragDropProvider
            sensors={(sensors) => sensors.map((sensor) => sensor === PointerSensor
              ? PointerSensor.configure({ activationConstraints: [] })
              : sensor)}
            onDragOver={(event) => {
              const sourceStatus = event.operation.source?.data.status
              const targetStatus = event.operation.target?.data.status
              // The sortable plugin reparents elements directly across lists.
              // React owns these cards, so let React move them after the drop instead.
              if (sourceStatus && targetStatus && sourceStatus !== targetStatus) event.preventDefault()
            }}
            onDragEnd={(event) => {
            if (event.canceled) return
            const taskId = event.operation.source?.data.taskId
            const status = event.operation.target?.data.status as TaskStatus | undefined
            if (typeof taskId === "string" && status && columns.some((column) => column.id === status)) {
              const task = tasks.find((item) => item.id === taskId)
              if (task) {
                moveMutation.mutate({ ...task, status })
              }
            }
          }}
          >
            <div className="flex h-full min-w-max items-stretch gap-4">
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
