"use client"

import { Editor } from "@tinymce/tinymce-react"
import { Form, Input, Modal, Select } from "antd"
import { useEffect, type ReactNode } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeCreateTask, closeTaskDetails, editTaskDetails, showTaskDetails, taskAdded, taskUpdated, tasksHydrated, taskStatuses, type BoardTask, type TaskStatus } from "@/store/tasksSlice"
import { storedTaskSchema, taskFormSchema, type TaskFormValues } from "@/store/taskSchema"
import { SIDEBAR_PREFERENCE_KEY, sidebarStateHydrated } from "@/store/uiSlice"

export const TASK_STORAGE_KEY = "jiratodo-tasks"

function TaskDialog({ initialStatus, mode, task }: { initialStatus: TaskStatus; mode: "create" | "edit"; task?: BoardTask }) {
  const dispatch = useAppDispatch()
  const [form] = Form.useForm<TaskFormValues>()
  const editing = mode === "edit" && !!task

  function close() {
    if (editing) dispatch(showTaskDetails())
    else dispatch(closeCreateTask())
  }

  function submitTask(values: TaskFormValues) {
    const taskValues = taskFormSchema.parse(values)

    if (editing && task) {
      dispatch(taskUpdated({ ...task, ...taskValues }))
      dispatch(showTaskDetails())
      return
    }

    dispatch(taskAdded({ ...taskValues, id: crypto.randomUUID(), createdAt: new Date().toISOString() }))
    close()
  }

  return (
    <Modal key={`${mode}-${task?.id ?? initialStatus}`} open title={editing ? "Edit task" : "Create task"} okText={editing ? "Save changes" : "Create task"} cancelText="Cancel" centered width={720} destroyOnHidden onCancel={close} onOk={() => form.submit()}>
      <Form form={form} layout="vertical" initialValues={{ title: task?.title ?? "", description: task?.description ?? "", status: task?.status ?? initialStatus, dueDate: task?.dueDate ?? "" }} onFinish={submitTask} className="pt-3">
        <Form.Item name="title" label="Task name">
          <Input autoFocus placeholder="What needs to get done?" />
        </Form.Item>
        <Form.Item label="Description">
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
            initialValue={task?.description ?? ""}
            onEditorChange={(value) => form.setFieldValue("description", value)}
            init={{
              base_url: "/tinymce", suffix: ".min", height: 210, menubar: false, statusbar: false,
              plugins: "lists link", toolbar: "undo redo | blocks | bold italic | bullist numlist | link",
              toolbar_mode: "sliding", promotion: false, branding: false,
              content_css: "/tinymce/skins/content/default/content.min.css", skin_url: "/tinymce/skins/ui/oxide",
              placeholder: "Add context, acceptance criteria, or notes...",
            }}
          />
        </Form.Item>
        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Item name="status" label="Status">
            <Select options={taskStatuses.map((status) => ({ value: status, label: statusLabels[status] }))} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due date"><Input type="date" /></Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

function TaskDetailsDialog({ task }: { task: BoardTask }) {
  const dispatch = useAppDispatch()
  const close = () => dispatch(closeTaskDetails())
  const description = task.description
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .trim()

  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") dispatch(closeTaskDetails())
    }
    document.addEventListener("keydown", onEscape)
    return () => document.removeEventListener("keydown", onEscape)
  }, [dispatch])

  return (
    <Modal
      open
      centered
      width={760}
      title={<div><span className="text-xs font-medium text-slate-400">JiraTodo / Task</span><h2 className="mb-0 mt-1 text-lg font-semibold text-slate-900">{task.title}</h2></div>}
      footer={[
        <button key="close" type="button" onClick={close} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Close</button>,
        <button key="edit" type="button" onClick={() => dispatch(editTaskDetails())} className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700">Edit task</button>,
      ]}
      onCancel={close}
    >
      <div className="border-t border-slate-100 pt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-800">{statusLabels[task.status]}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Due date</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-800">{task.dueDate ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "No due date"}</p>
          </div>
        </div>
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-slate-800">Description</h3>
          <p className="mt-2 min-h-24 whitespace-pre-wrap rounded-lg border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600">{description || "No description added."}</p>
        </section>
        <p className="mt-5 text-xs text-slate-400">Created {new Date(task.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p>
      </div>
    </Modal>
  )
}

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  "in-review": "In review",
  completed: "Completed",
  "due-date": "Due date",
}

export function TaskWorkspaceProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const { items: tasks, hydrated, createDialogOpen, createStatus, activeTaskId, taskView } = useAppSelector((state) => state.tasks)
  const { sidebarOpen, hydrated: sidebarHydrated } = useAppSelector((state) => state.ui)
  const activeTask = tasks.find((task) => task.id === activeTaskId)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TASK_STORAGE_KEY)
      if (!stored) {
        dispatch(tasksHydrated([]))
        return
      }
      const parsed: unknown = JSON.parse(stored)
      const result = Array.isArray(parsed) ? storedTaskSchema.array().safeParse(parsed) : null
      dispatch(tasksHydrated(result?.success ? result.data : []))
    } catch {
      dispatch(tasksHydrated([]))
    }
  }, [dispatch])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY)
      dispatch(sidebarStateHydrated(stored === null ? true : stored === "true"))
    } catch {
      dispatch(sidebarStateHydrated(true))
    }
  }, [dispatch])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks))
  }, [hydrated, tasks])

  useEffect(() => {
    if (sidebarHydrated) {
      const value = String(sidebarOpen)
      window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, value)
      document.cookie = `${SIDEBAR_PREFERENCE_KEY}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`
    }
  }, [sidebarHydrated, sidebarOpen])

  return (
    <>
      {children}
      {createDialogOpen && <TaskDialog initialStatus={createStatus} mode="create" />}
      {activeTask && taskView === "details" && <TaskDetailsDialog task={activeTask} />}
      {activeTask && taskView === "edit" && <TaskDialog initialStatus={activeTask.status} mode="edit" task={activeTask} />}
    </>
  )
}
