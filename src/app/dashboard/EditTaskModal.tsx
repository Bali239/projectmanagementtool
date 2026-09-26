"use client"

import { Alert, Button, Form, Modal, Spin } from "antd"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { fetchTasks, updateTask } from "@/lib/api/tasks"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { showTaskDetails, type BoardTask } from "@/store/tasksSlice"
import TaskFormFields, { type TaskFormValues } from "./TaskFormFields"

export default function EditTaskModal() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { activeTaskId, taskView } = useAppSelector((state) => state.tasks)
  const [form] = Form.useForm<TaskFormValues>()
  const [description, setDescription] = useState("")
  const { data: tasks = [], isError, error } = useQuery({
    queryKey: ["tasks", user?.uid],
    queryFn: () => fetchTasks(),
    enabled: !!user && taskView === "edit" && !!activeTaskId,
  })
  const task = tasks.find((item) => item.id === activeTaskId)

  useEffect(() => {
    if (!task) return
    form.setFieldsValue({
      title: task.title,
      status: task.status,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      dueTime: task.dueTime ? dayjs(`2000-01-01T${task.dueTime}`) : null,
    })
    setDescription(task.description)
  }, [form, task])

  const mutation = useMutation({
    mutationFn: updateTask,
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<BoardTask[]>(["tasks", user?.uid], (current) => current?.map((item) => item.id === updatedTask.id ? updatedTask : item))
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] })
      dispatch(showTaskDetails())
    },
  })

  function submit(values: TaskFormValues) {
    if (!task) return
    mutation.mutate({
      ...task,
      title: values.title.trim(),
      description,
      status: values.status,
      dueDate: values.dueDate?.format("YYYY-MM-DD") ?? null,
      dueTime: values.dueDate ? values.dueTime?.format("HH:mm") ?? null : null,
    })
  }

  return (
    <Modal
      open={taskView === "edit"}
      onCancel={() => dispatch(showTaskDetails())}
      title={<div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Update work item</p><h2 className="m-0 text-lg font-semibold text-slate-900">Edit task</h2></div>}
      footer={null}
      width={700}
      destroyOnHidden
      centered
    >
      {isError ? <Alert type="error" showIcon message="Task could not be loaded" description={error.message} /> : task ? (
        <Form form={form} layout="vertical" onFinish={submit} className="pt-5">
          <TaskFormFields form={form} description={description} onDescriptionChange={setDescription} />
          {mutation.isError && <p role="alert" className="mb-3 text-sm text-red-600">{mutation.error.message}</p>}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button onClick={() => dispatch(showTaskDetails())}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={mutation.isPending}>Save changes</Button>
          </div>
        </Form>
      ) : <div className="flex min-h-48 items-center justify-center"><Spin /></div>}
    </Modal>
  )
}