"use client"

import { useDroppable } from "@dnd-kit/react"
import { Button, Badge } from "antd"
import { Plus } from "lucide-react"
import { useAppDispatch } from "@/store/hooks"
import { openCreateTask, type BoardTask, type TaskStatus } from "@/store/tasksSlice"
import TaskCard from "./TaskCard"

export const boardColumns: { status: TaskStatus; label: string; tone: string; marker: string }[] = [
  { status: "todo", label: "To do", tone: "border-t-sky-500", marker: "bg-sky-500" },
  { status: "in-review", label: "In review", tone: "border-t-violet-500", marker: "bg-violet-500" },
  { status: "in-progress", label: "Pending", tone: "border-t-amber-500", marker: "bg-amber-500" },
  { status: "completed", label: "Completed", tone: "border-t-emerald-600", marker: "bg-emerald-600" },
]

type Column = (typeof boardColumns)[number]
type TaskColumnProps = { column: Column; tasks: BoardTask[]; searchQuery: string }

export default function TaskColumn({ column, tasks, searchQuery }: TaskColumnProps) {
  const dispatch = useAppDispatch()
  const { ref, isDropTarget } = useDroppable({ id: `column:${column.status}` })

  return (
    <section ref={ref} aria-label={`${column.label} tasks`} className={`flex min-h-72 min-w-0 flex-col rounded-xl border border-slate-200/80 border-t-[3px] bg-slate-100/80 p-3 transition-colors sm:p-4 ${column.tone} ${isDropTarget ? "bg-teal-50 ring-2 ring-inset ring-teal-300" : ""}`}>
      <header className="mb-3 flex items-center gap-2 rounded-lg bg-white/80 px-2.5 py-2 shadow-sm">
        <span className={`size-2.5 shrink-0 rounded-full ${column.marker}`} />
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{column.label}</h2>
        <Badge count={tasks.length} color="#64748b" overflowCount={99} />
        <Button type="text" size="small" aria-label={`Create task in ${column.label}`} icon={<Plus size={15} />} className="shrink-0 text-slate-500 hover:bg-slate-100" onClick={() => dispatch(openCreateTask(column.status))} />
      </header>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        {tasks.length === 0 && <div className="flex min-h-36 flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300/90 bg-white/40 px-3 text-center text-xs text-slate-400">{searchQuery ? "No matching tasks" : "Drop tasks here"}</div>}
      </div>
    </section>
  )
}
