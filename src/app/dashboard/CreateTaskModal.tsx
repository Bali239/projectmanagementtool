"use client"

import { Button, Form, Modal } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, type KeyboardEvent } from "react"
import { useAuth } from "@/context/AuthContext"
import { createTask } from "@/lib/api/tasks"
import { taskQueryKeys } from "@/lib/queryKeys"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeCreateTask } from "@/store/tasksSlice"
import TaskFormFields, { type TaskFormValues } from "./TaskFormFields"

function handleModalPageScroll(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "PageDown" && event.key !== "PageUp") return
  const target = event.target as HTMLElement
  if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return
  const body = event.currentTarget.querySelector<HTMLElement>(".ant-modal-body")
  if (!body) return
  event.preventDefault()
  body.scrollBy({ top: (event.key === "PageDown" ? 1 : -1) * body.clientHeight * 0.8, behavior: "smooth" })
}

export default function CreateTaskModal() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { workspace } = useAuth()
  const { createDialogOpen, createStatus } = useAppSelector((state) => state.tasks)
  const [form] = Form.useForm<TaskFormValues>()

  useEffect(() => {
    if (!createDialogOpen) return
    form.resetFields()
    form.setFieldsValue({ title: "", description: "", status: createStatus, dueDate: null, dueTime: null, assigneeId: null })
  }, [createDialogOpen, createStatus, form])

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.list(workspace?.id) })
      dispatch(closeCreateTask())
    },
  })

  function submit(values: TaskFormValues) {
    mutation.mutate({
      title: values.title.trim(),
      description: values.description,
      status: values.status,
      dueDate: values.dueDate?.format("YYYY-MM-DD") ?? null,
      dueTime: values.dueDate ? values.dueTime?.format("HH:mm") ?? null : null,
      assigneeId: values.assigneeId ?? null,
    })
  }

  return (
    <Modal
      open={createDialogOpen}
      onCancel={() => dispatch(closeCreateTask())}
      title={<div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">New work item</p><h2 className="m-0 text-lg font-semibold text-slate-900">Create a task</h2></div>}
      width="min(700px, calc(100vw - 16px))"
      styles={{
        container: { display: "flex", flexDirection: "column", maxHeight: "calc(100dvh - 32px)" },
        body: { flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "16px" },
        footer: { flexShrink: 0 },
      }}
      focusable={{ trap: false }}
      forceRender
      destroyOnHidden
      centered
      modalRender={(node) => <div onKeyDownCapture={handleModalPageScroll}>{node}</div>}
      footer={
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button className="w-full sm:w-auto" onClick={() => dispatch(closeCreateTask())}>Cancel</Button>
          <Button className="w-full sm:w-auto" type="primary" htmlType="submit" form="create-task-form" loading={mutation.isPending}>Create task</Button>
        </div>
      }
    >
      <Form id="create-task-form" form={form} layout="vertical" onFinish={submit} className="pt-1 sm:pt-3">
        <TaskFormFields form={form} />
        {mutation.isError && <p role="alert" className="mb-3 text-sm text-red-600">{mutation.error.message}</p>}
      </Form>
    </Modal>
  )
}
