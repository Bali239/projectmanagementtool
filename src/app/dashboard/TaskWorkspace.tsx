"use client"

import { Editor } from "@tinymce/tinymce-react"
import { Form, Input, Modal, Select } from "antd"
import { useEffect, type ReactNode } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeCreateTask, taskAdded, tasksHydrated, taskStatuses, type BoardTask, type TaskStatus } from "@/store/tasksSlice"
import { storedTaskSchema, taskFormSchema, type TaskFormValues } from "@/store/taskSchema"
import { SIDEBAR_PREFERENCE_KEY, sidebarStateHydrated } from "@/store/uiSlice"

export const TASK_STORAGE_KEY = "jiratodo-tasks"

function TaskDialog({ initialStatus }: { initialStatus: TaskStatus }) {
  const dispatch = useAppDispatch()
  const [form] = Form.useForm<TaskFormValues>()

  function close() {
    dispatch(closeCreateTask())
  }

  function submitTask(values: TaskFormValues) {
    const parsed = taskFormSchema.safeParse(values)
    if (!parsed.success) return

    const newTask: BoardTask = {
      ...parsed.data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    dispatch(taskAdded(newTask))
    close()
  }

  return (
    <Modal open title="Create task" okText="Create task" cancelText="Cancel" centered width={720} destroyOnHidden onCancel={close} onOk={() => form.submit()}>
      <Form form={form} layout="vertical" initialValues={{ title: "", description: "", status: initialStatus, dueDate: "" }} onFinish={submitTask} className="pt-3">
        <Form.Item name="title" label="Task name" rules={[{ required: true, message: "Enter a task name." }, { max: 120, message: "Task names must be 120 characters or fewer." }]}>
          <Input autoFocus placeholder="What needs to get done?" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
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
          <Form.Item name="status" label="Status" rules={[{ required: true, message: "Choose a status." }]}>
            <Select options={taskStatuses.map((status) => ({ value: status, label: statusLabels[status] }))} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due date"><Input type="date" /></Form.Item>
        </div>
      </Form>
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
  const { items: tasks, hydrated, createDialogOpen, createStatus } = useAppSelector((state) => state.tasks)
  const { sidebarOpen, hydrated: sidebarHydrated } = useAppSelector((state) => state.ui)

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
      {createDialogOpen && <TaskDialog key={createStatus} initialStatus={createStatus} />}
    </>
  )
}
