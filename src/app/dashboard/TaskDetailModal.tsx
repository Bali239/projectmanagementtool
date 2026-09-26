"use client"

import { Editor } from "@tinymce/tinymce-react"
import { Alert, Button, Modal, Spin, Tag } from "antd"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, Clock3, Pencil, Trash2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { fetchTasks, deleteTask } from "@/lib/api/tasks"
import { formatTaskDueDate } from "@/lib/formatTaskDueDate"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeTaskDetails, editTaskDetails, type BoardTask, type TaskStatus } from "@/store/tasksSlice"

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-review": "In review",
  "in-progress": "Pending",
  completed: "Completed",
}

export default function TaskDetailModal() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { activeTaskId, taskView } = useAppSelector((state) => state.tasks)
  const { data: tasks = [], isPending, isError, error } = useQuery({
    queryKey: ["tasks", user?.uid],
    queryFn: () => fetchTasks(),
    enabled: !!user && taskView === "details" && !!activeTaskId,
  })
  const task = tasks.find((item) => item.id === activeTaskId)

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: (_result, taskId) => {
      queryClient.setQueryData<BoardTask[]>(["tasks", user?.uid], (current) => current?.filter((item) => item.id !== taskId))
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] })
      dispatch(closeTaskDetails())
    },
  })

  function confirmDelete() {
    if (!task) return
    Modal.confirm({
      title: "Delete this task?",
      content: `“${task.title}” will be permanently removed.`,
      okText: "Delete task",
      okButtonProps: { danger: true, loading: deleteMutation.isPending },
      cancelText: "Cancel",
      onOk: () => deleteMutation.mutateAsync(task.id),
    })
  }

  const dueLabel = formatTaskDueDate(task?.dueDate ?? null, task?.dueTime ?? null)

  return (
    <Modal
      open={taskView === "details"}
      onCancel={() => dispatch(closeTaskDetails())}
      title={<div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Task details</p><h2 className="m-0 wrap-break-word pr-4 text-lg font-semibold text-slate-900">{task?.title || "Task details"}</h2></div>}
      footer={task ? <div className="flex flex-wrap items-center justify-between gap-2">
        <Button danger icon={<Trash2 size={15} />} loading={deleteMutation.isPending} onClick={confirmDelete}>Delete</Button>
        <div className="flex gap-2"><Button onClick={() => dispatch(closeTaskDetails())}>Close</Button><Button type="primary" icon={<Pencil size={15} />} onClick={() => dispatch(editTaskDetails())}>Edit task</Button></div>
      </div> : null}
      width="min(720px, calc(100vw - 24px))"
      classNames={{ body: "task-detail-modal-body" }}
      styles={{ body: { maxHeight: "min(60dvh, 640px)", overflowY: "auto" } }}
      destroyOnHidden
      centered
    >
      {isError ? <Alert type="error" showIcon message="Task could not be loaded" description={error.message} /> : task ? (
        <div className="space-y-5 py-3">
          <div className="flex flex-wrap gap-2">
            <Tag icon={<Clock3 size={13} />} color="blue">{statusLabels[task.status]}</Tag>
            {dueLabel && <Tag icon={<CalendarDays size={13} />} color="gold">Due {dueLabel}</Tag>}
          </div>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</h3>
            {task.description.trim() ? <div className="overflow-hidden rounded-md border border-slate-200">
              <Editor tinymceScriptSrc="/tinymce/tinymce.min.js" licenseKey="gpl" value={task.description} readonly init={{ height: 240, menubar: false, toolbar: false, statusbar: false, branding: false, promotion: false, content_style: "html { overflow-y: auto; } body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; line-height: 1.7; color: #334155; padding: 12px 16px; } h1,h2,h3 { color: #0f172a; } ul,ol { padding-left: 1.5rem; }" }} />
            </div> : <p className="rounded-md border border-dashed border-slate-300 px-4 py-7 text-center text-sm text-slate-400">No description added.</p>}
          </section>
          <p className="text-xs text-slate-400">Created {new Date(task.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      ) : <div className="flex min-h-48 items-center justify-center">{isPending ? <Spin /> : <p className="text-sm text-slate-500">This task is no longer available.</p>}</div>}
    </Modal>
  )
}
