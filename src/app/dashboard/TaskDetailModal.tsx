"use client"

import { Editor } from "@tinymce/tinymce-react"
import { Alert, Button, Modal, Tag } from "antd"
import { useQuery } from "@tanstack/react-query"
import { CalendarDays, Clock3, Pencil } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { fetchTasks } from "@/lib/api/tasks"
import { taskQueryKeys } from "@/lib/queryKeys"
import { getFriendlyErrorMessage } from "@/lib/friendlyError"
import LoadingState from "@/components/LoadingState"
import { formatTaskDueDate } from "@/lib/formatTaskDueDate"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeTaskDetails, editTaskDetails, type TaskStatus } from "@/store/tasksSlice"

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-review": "In review",
  "in-progress": "Pending",
  completed: "Completed",
}

export default function TaskDetailModal() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { activeTaskId, taskView } = useAppSelector((state) => state.tasks)
  const { data: tasks = [], isPending, isError, error } = useQuery({
    queryKey: taskQueryKeys.list(user?.uid),
    queryFn: () => fetchTasks(),
    enabled: !!user && taskView === "details" && !!activeTaskId,
  })
  const task = tasks.find((item) => item.id === activeTaskId)

  const dueLabel = formatTaskDueDate(task?.dueDate ?? null, task?.dueTime ?? null)

  return (
    <Modal
      open={taskView === "details"}
      onCancel={() => dispatch(closeTaskDetails())}
      title={<div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Task details</p><h2 className="m-0 wrap-break-word pr-4 text-lg font-semibold text-slate-900">{task?.title || "Task details"}</h2></div>}
      footer={task ? <div className="flex justify-end gap-2"><Button onClick={() => dispatch(closeTaskDetails())}>Close</Button><Button type="primary" icon={<Pencil size={15} />} onClick={() => dispatch(editTaskDetails())}>Edit task</Button></div> : null}
      width="min(720px, calc(100vw - 24px))"
      classNames={{ body: "scrollbar-none" }}
      styles={{ body: { maxHeight: "min(60dvh, 640px)", overflowY: "auto" } }}
      destroyOnHidden
      centered
    >
      {isError ? <Alert type="error" showIcon message="Task could not be loaded" description={getFriendlyErrorMessage(error)} /> : task ? (
        <div className="space-y-5 py-3">
          <div className="flex flex-wrap gap-2">
            <Tag icon={<Clock3 size={13} />} color="blue">{statusLabels[task.status]}</Tag>
            {dueLabel && <Tag icon={<CalendarDays size={13} />} color="gold">Due {dueLabel}</Tag>}
          </div>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</h3>
            {task.description.trim() ? <div className="overflow-hidden rounded-md border border-slate-200">
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                licenseKey="gpl"
                value={task.description}
                readonly
                onInit={(_event, editor) => {
                  editor.on("click", (event) => {
                    const target = event.target as Node | null
                    const link = target ? editor.dom.getParent(target, "a") : null
                    const href = link?.getAttribute("href")?.trim()

                    if (href) {
                      event.preventDefault()
                      try {
                        const url = new URL(href, window.location.href)
                        if (url.protocol === "http:" || url.protocol === "https:") {
                          window.open(url.href, "_blank", "noopener,noreferrer")
                          return
                        }
                      } catch {
                        // Treat invalid or unsupported URLs as search text below.
                      }
                    }

                    const block = target ? editor.dom.getParent(target, "p, li, h1, h2, h3, blockquote, pre") : null
                    const searchText = editor.selection.getContent({ format: "text" }).trim()
                      || link?.textContent?.trim()
                      || block?.textContent?.trim()
                    if (!searchText) return

                    event.preventDefault()
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchText)}`, "_blank", "noopener,noreferrer")
                  })
                }}
                init={{ height: 240, menubar: false, toolbar: false, statusbar: false, branding: false, promotion: false, content_style: "html { overflow-y: auto; } body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; line-height: 1.7; color: #334155; padding: 12px 16px; } h1,h2,h3 { color: #0f172a; } ul,ol { padding-left: 1.5rem; }" }}
              />
            </div> : <p className="rounded-md border border-dashed border-slate-300 px-4 py-7 text-center text-sm text-slate-400">No description added.</p>}
          </section>
          <p className="text-xs text-slate-400">Created {new Date(task.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      ) : isPending ? <LoadingState className="min-h-48" message="Loading task details..." /> : <div className="flex min-h-48 items-center justify-center"><p className="text-sm text-slate-500">This task is no longer available.</p></div>}
    </Modal>
  )
}
