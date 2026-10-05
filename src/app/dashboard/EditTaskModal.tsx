"use client"

import { Alert, App, Button, Form, Modal } from "antd"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { Trash2 } from "lucide-react"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { deleteTask, fetchTasks, updateTask } from "@/lib/api/tasks"
import { taskQueryKeys } from "@/lib/queryKeys"
import { getFriendlyErrorMessage } from "@/lib/friendlyError"
import LoadingState from "@/components/LoadingState"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeTaskEdit, showTaskDetails, type BoardTask } from "@/store/tasksSlice"
import TaskFormFields, { type TaskFormValues } from "./TaskFormFields"

export default function EditTaskModal() {
  const { modal } = App.useApp()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { workspace } = useAuth()
  const { activeTaskId, taskView } = useAppSelector((state) => state.tasks)
  const [form] = Form.useForm<TaskFormValues>()
  const { data: tasks = [], isError, error } = useQuery({
    queryKey: taskQueryKeys.list(workspace?.id),
    queryFn: () => fetchTasks(),
    enabled: !!workspace && taskView === "edit" && !!activeTaskId,
  })
  const task = tasks.find((item) => item.id === activeTaskId)

  useEffect(() => {
    if (!task) return
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      dueTime: task.dueTime ? dayjs(`2000-01-01T${task.dueTime}`) : null,
      assigneeId: task.assignee?.id ?? null,
    })
  }, [form, task])

  const mutation = useMutation({
    mutationFn: updateTask,
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<BoardTask[]>(taskQueryKeys.list(workspace?.id), (current) => current?.map((item) => item.id === updatedTask.id ? updatedTask : item))
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.list(workspace?.id) })
      dispatch(showTaskDetails())
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: (_result, taskId) => {
      queryClient.setQueryData<BoardTask[]>(taskQueryKeys.list(workspace?.id), (current) => current?.filter((item) => item.id !== taskId))
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.list(workspace?.id) })
      dispatch(closeTaskEdit())
    },
  })

  function confirmDelete() {
    if (!task) return
    modal.confirm({
      title: "Delete this task?",
      content: `“${task.title}” will be permanently removed.`,
      okText: "Delete task",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => deleteMutation.mutateAsync(task.id),
    })
  }

  function submit(values: TaskFormValues) {
    if (!task) return
    mutation.mutate({
      ...task,
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
      open={taskView === "edit"}
      onCancel={() => dispatch(closeTaskEdit())}
      title={<div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Update work item</p><h2 className="m-0 text-lg font-semibold text-slate-900">Edit task</h2></div>}
      footer={null}
      width="min(700px, calc(100vw - 24px))"
      focusable={{ trap: false }}
      forceRender
      destroyOnHidden
      centered
    >
      {isError ? <Alert type="error" showIcon message="Task could not be loaded" description={getFriendlyErrorMessage(error)} /> : task ? (
        <Form form={form} layout="vertical" onFinish={submit} className="pt-5">
          <TaskFormFields form={form} />
          {mutation.isError && <p role="alert" className="mb-3 text-sm text-red-600">{mutation.error.message}</p>}
          {deleteMutation.isError && <p role="alert" className="mb-3 text-sm text-red-600">{deleteMutation.error.message}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            
            <div className="flex w-full min-w-0 flex-row gap-2 sm:justify-end">
              <Button className="w-full flex-1" danger icon={<Trash2 size={15} />} loading={deleteMutation.isPending} disabled={mutation.isPending} onClick={confirmDelete}>Delete task</Button>
              <Button className="w-full flex-1" onClick={() => dispatch(closeTaskEdit())}>Cancel</Button>
              <Button className="w-full flex-1" type="primary" htmlType="submit" loading={mutation.isPending} disabled={deleteMutation.isPending}>Save changes</Button>
              
            </div>
          </div>
        </Form>
      ) : <LoadingState className="min-h-48" message="Loading task details..." />}
    </Modal>
  )
}
