"use client"

import { useDraggable } from "@dnd-kit/react"
import { Button, Tag } from "antd"
import { CalendarDays, GripVertical } from "lucide-react"
import { useAppDispatch } from "@/store/hooks"
import { openTaskDetails, type BoardTask } from "@/store/tasksSlice"
import { formatTaskDueDate } from "@/lib/formatTaskDueDate"

export default function TaskCard({ task }: { task: BoardTask }) {
  const dispatch = useAppDispatch()
  const { ref, handleRef, isDragging } = useDraggable({ id: `task:${task.id}` })
  const dueLabel = formatTaskDueDate(task.dueDate, task.dueTime, "compact")
  const descriptionText = task.description.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()

  return (
    <article ref={ref} className={`rounded-lg border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${isDragging ? "opacity-50" : ""}`}>
      <div className="mb-1 flex items-start gap-1">
        <button type="button" onClick={() => dispatch(openTaskDetails(task.id))} className="min-w-0 flex-1 wrap-break-word text-left text-sm font-semibold leading-5 text-slate-800 outline-none hover:text-teal-800 focus-visible:underline">{task.title}</button>
        <Button ref={handleRef} type="text" size="small" aria-label={`Drag ${task.title}`} className="shrink-0 text-slate-400 active:cursor-grabbing" icon={<GripVertical size={16} />} />
      </div>
      {descriptionText && <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-500">{descriptionText}</p>}
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
        <Tag variant="filled" className="m-0 bg-slate-100 font-mono text-[10px] text-slate-500">{task.id.slice(0, 8)}</Tag>
        {dueLabel && <span className="inline-flex items-center gap-1 text-[11px] text-slate-500"><CalendarDays size={12} />{dueLabel}</span>}
      </div>
    </article>
  )
}
