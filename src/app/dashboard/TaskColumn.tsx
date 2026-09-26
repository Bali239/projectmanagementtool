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
    <section ref={ref} aria-label={`${column.label} tasks`} className={`flex min-h-[360px] flex-col rounded-lg border border-slate-200 border-t-[3px] bg-[#edf1ef] p-3 transition-colors ${column.tone} ${isDropTarget ? "bg-teal-50 ring-2 ring-inset ring-teal-300" : ""}`}>
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className={`size-2 rounded-full ${column.marker}`} />
        <h2 className="flex-1 text-sm font-semibold text-slate-800">{column.label}</h2>
        <Badge count={tasks.length} color="#64748b" overflowCount={99} />
        <Button type="text" size="small" aria-label={`Create task in ${column.label}`} icon={<Plus size={15} />} onClick={() => dispatch(openCreateTask(column.status))} />
      </header>
      <div className="flex flex-1 flex-col gap-2.5">
        {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        {tasks.length === 0 && <div className={`flex min-h-24 flex-1 items-center justify-center rounded-md border border-dashed text-xs ${searchQuery ? "border-slate-200 text-slate-400" : "border-slate-300 text-slate-400"}`}>{searchQuery ? "No matching tasks" : "Drop tasks here"}</div>}
      </div>
    </section>
  )
}