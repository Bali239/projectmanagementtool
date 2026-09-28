"use client"

import { useDraggable } from "@dnd-kit/react"
import { Button } from "antd"
import { CalendarDays, Eye, GripVertical, Pencil } from "lucide-react"
import { createElement, useEffect, useState, type ReactNode } from "react"
import { useAppDispatch } from "@/store/hooks"
import { openTaskDetails, openTaskEdit, type BoardTask } from "@/store/tasksSlice"
import { formatTaskDueDate } from "@/lib/formatTaskDueDate"

const allowedTags = new Set([
  "a", "b", "blockquote", "br", "code", "em", "h1", "h2", "h3", "i", "li", "ol", "p", "pre", "strong", "u", "ul",
])
const allowedListStyles = new Set([
  "circle", "disc", "square", "decimal", "lower-alpha", "lower-greek", "lower-roman", "upper-alpha", "upper-roman",
])

function renderSafeRichText(node: Node, key: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent
  if (!(node instanceof HTMLElement)) return null

  const tag = node.tagName.toLowerCase()
  const children = Array.from(node.childNodes).map((child, index) => renderSafeRichText(child, `${key}-${index}`))
  if (!allowedTags.has(tag)) return children

  if (tag === "a") {
    const href = node.getAttribute("href")?.trim()
    if (!href || !/^https?:\/\//i.test(href)) return children
    return createElement("a", { key, href, target: "_blank", rel: "noopener noreferrer", className: "text-teal-700 underline" }, children)
  }

  if (tag === "ol" || tag === "ul") {
    const listStyleType = node.style.listStyleType
    const style = allowedListStyles.has(listStyleType) ? { listStyleType } : undefined
    return createElement(tag, { key, style }, children)
  }

  if (["blockquote", "h1", "h2", "h3", "p"].includes(tag)) {
    const textAlign = node.style.textAlign
    const style = ["left", "center", "right", "justify"].includes(textAlign) ? { textAlign: textAlign as "left" | "center" | "right" | "justify" } : undefined
    return createElement(tag, { key, style }, children)
  }

  return createElement(tag, { key }, children)
}

export default function TaskCard({ task }: { task: BoardTask }) {
  const dispatch = useAppDispatch()
  const { ref, handleRef, isDragging } = useDraggable({ id: `task:${task.id}` })
  const dueLabel = formatTaskDueDate(task.dueDate, task.dueTime, "compact")
  const [descriptionContent, setDescriptionContent] = useState<{ nodes: ReactNode[]; text: string }>({ nodes: [], text: "" })

  useEffect(() => {
    const document = new DOMParser().parseFromString(task.description, "text/html")
    setDescriptionContent({
      nodes: Array.from(document.body.childNodes).map((node, index) => renderSafeRichText(node, `description-${index}`)),
      text: (document.body.textContent ?? "").replace(/[\u00a0\u200B-\u200D\uFEFF]/g, " ").trim(),
    })
  }, [task.description])

  const hasDescription = descriptionContent.text.length > 0

  return (
    <article
      ref={ref}
      className={`group min-w-0 shrink-0 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 wrap-break-word text-sm font-semibold leading-5 text-slate-800">{task.title}</h3>
        <div className="-mr-1 -mt-1 flex shrink-0 items-center">
          <Button type="text" size="small" aria-label={`View ${task.title}`} title="View task" className="text-slate-400 hover:text-teal-700" icon={<Eye size={15} />} onClick={() => dispatch(openTaskDetails(task.id))} />
          <Button type="text" size="small" aria-label={`Edit ${task.title}`} title="Edit task" className="text-slate-400 hover:text-teal-700" icon={<Pencil size={14} />} onClick={() => dispatch(openTaskEdit(task.id))} />
          <Button ref={handleRef} type="text" size="small" aria-label={`Drag ${task.title}`} title="Drag task" className="cursor-grab text-slate-400 active:cursor-grabbing" icon={<GripVertical size={16} />} />
        </div>
      </div>

      <div className="mb-3 min-w-0">
        {hasDescription ? (
          <div
            className="max-h-32 overflow-y-auto pr-1 text-xs leading-relaxed text-slate-600 [&_a]:text-teal-700 [&_ol]:mb-1.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-1.5 [&_ul]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-4"
          >
            {descriptionContent.nodes}
          </div>
        ) : (
          <p className="text-xs italic text-slate-400">No details provided</p>
        )}
      </div>

      <div className="flex min-h-6 flex-wrap items-center gap-2">
        {dueLabel && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <CalendarDays size={12} />
            {dueLabel}
          </span>
        )}
      </div>
    </article>
  )
}
