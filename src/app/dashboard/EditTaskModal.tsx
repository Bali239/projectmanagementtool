"use client"

import { Alert, App, Button, Form, Modal } from "antd"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { Trash2 } from "lucide-react"
import { useEffect, type KeyboardEvent } from "react"
import { useAuth } from "@/context/AuthContext"
import { deleteTask, fetchTasks, updateTask } from "@/lib/api/tasks"
import { taskQueryKeys } from "@/lib/queryKeys"
import { getFriendlyErrorMessage } from "@/lib/friendlyError"
import LoadingState from "@/components/LoadingState"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeTaskEdit, showTaskDetails, type BoardTask } from "@/store/tasksSlice"
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

export default function EditTaskModal() {
  const { modal } = App.useApp()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { workspace } = useAuth()
  const { activeTaskId, taskView } = useAppSelector((state) => state.tasks)
  const [form] = Form.useForm<TaskFormValues>()
  const { data: tasks = [], isError, error } = useQuery({
    queryKey: taskQueryKeys.list(workspace?.id),
    queryFn: ({ queryKey }) => fetchTasks(queryKey[1]),
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
      footer={task ? (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button className="col-span-2 w-full sm:col-span-1 sm:mr-auto sm:w-auto" danger icon={<Trash2 size={15} />} loading={deleteMutation.isPending} disabled={mutation.isPending} onClick={confirmDelete}>Delete task</Button>
          <Button className="w-full sm:w-auto" onClick={() => dispatch(closeTaskEdit())}>Cancel</Button>
          <Button className="w-full sm:w-auto" type="primary" htmlType="submit" form="edit-task-form" loading={mutation.isPending} disabled={deleteMutation.isPending}>Save changes</Button>
        </div>
      ) : null}
    >
      {isError ? <Alert type="error" showIcon title="Task could not be loaded" description={getFriendlyErrorMessage(error)} /> : task ? (
        <Form id="edit-task-form" form={form} layout="vertical" onFinish={submit} className="pt-1 sm:pt-3">
          <TaskFormFields key={task.id} form={form} currentAssignee={task.assignee} />
          {mutation.isError && <p role="alert" className="mb-3 text-sm text-red-600">{mutation.error.message}</p>}
          {deleteMutation.isError && <p role="alert" className="mb-3 text-sm text-red-600">{deleteMutation.error.message}</p>}
        </Form>
      ) : <LoadingState className="min-h-48" message="Loading task details..." />}
    </Modal>
  )
}
