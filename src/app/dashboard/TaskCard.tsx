"use client"

import { useDraggable } from "@dnd-kit/react"
import { Button } from "antd"
import { CalendarDays, Eye, GripVertical, Pencil } from "lucide-react"
import { useAppDispatch } from "@/store/hooks"
import { openTaskDetails, openTaskEdit, type BoardTask } from "@/store/tasksSlice"
import { formatTaskDueDate } from "@/lib/formatTaskDueDate"

export default function TaskCard({ task }: { task: BoardTask }) {
  const dispatch = useAppDispatch()
  const { ref, handleRef, isDragging } = useDraggable({ id: `task:${task.id}` })
  const dueLabel = formatTaskDueDate(task.dueDate, task.dueTime, "compact")
  const descriptionText = task.description.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()

  return (
    <article ref={ref} className={`group rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${isDragging ? "opacity-50" : ""}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 wrap-break-word text-sm font-semibold leading-5 text-slate-800">{task.title}</h3>
        <div className="-mr-1 -mt-1 flex shrink-0 items-center">
          <Button type="text" size="small" aria-label={`View ${task.title}`} title="View task" className="text-slate-400 hover:text-teal-700" icon={<Eye size={15} />} onClick={() => dispatch(openTaskDetails(task.id))} />
          <Button type="text" size="small" aria-label={`Edit ${task.title}`} title="Edit task" className="text-slate-400 hover:text-teal-700" icon={<Pencil size={14} />} onClick={() => dispatch(openTaskEdit(task.id))} />
          <Button ref={handleRef} type="text" size="small" aria-label={`Drag ${task.title}`} title="Drag task" className="cursor-grab text-slate-400 active:cursor-grabbing" icon={<GripVertical size={16} />} />
        </div>
      </div>
      {descriptionText && <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-500">{descriptionText}</p>}
      <div className="flex min-h-6 flex-wrap items-center gap-2">
        {dueLabel && <span className="inline-flex items-center gap-1 text-[11px] text-slate-500"><CalendarDays size={12} />{dueLabel}</span>}
      </div>
    </article>
  )
}
