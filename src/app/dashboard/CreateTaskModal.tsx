"use client"

import { Button, Form, Modal } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { createTask } from "@/lib/api/tasks"
import { taskQueryKeys } from "@/lib/queryKeys"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeCreateTask } from "@/store/tasksSlice"
import TaskFormFields, { type TaskFormValues } from "./TaskFormFields"

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
      footer={null}
      width="min(700px, calc(100vw - 24px))"
      focusable={{ trap: false }}
      forceRender
      destroyOnHidden
      centered
    >
      <Form form={form} layout="vertical" onFinish={submit} className="pt-5">
        <TaskFormFields form={form} />
        {mutation.isError && <p role="alert" className="mb-3 text-sm text-red-600">{mutation.error.message}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button onClick={() => dispatch(closeCreateTask())}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>Create task</Button>
        </div>
      </Form>
    </Modal>
  )
}
