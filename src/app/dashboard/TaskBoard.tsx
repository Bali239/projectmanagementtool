"use client"

import { DragDropProvider } from "@dnd-kit/react"
import { Alert, message } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"
import { updateTask } from "@/lib/api/tasks"
import { useAppSelector } from "@/store/hooks"
import type { BoardTask, TaskStatus } from "@/store/tasksSlice"
import TaskColumn, { boardColumns } from "./TaskColumn"

type TaskBoardProps = { tasks: BoardTask[] }

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const searchQuery = useAppSelector((state) => state.tasks.searchQuery)
  const queryKey = ["tasks", user?.uid]
  const [messageApi, contextHolder] = message.useMessage()

  const moveTaskMutation = useMutation({
    mutationFn: updateTask,
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey })
      const previousTasks = queryClient.getQueryData<BoardTask[]>(queryKey)
      queryClient.setQueryData<BoardTask[]>(queryKey, (current) => current?.map((task) => task.id === updatedTask.id ? updatedTask : task))
      return { previousTasks }
    },
    onError: (error, _updatedTask, context) => {
      if (context?.previousTasks) queryClient.setQueryData(queryKey, context.previousTasks)
      messageApi.error(error.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  function handleDragEnd(event: { canceled: boolean; operation: { source?: { id: string | number } | null; target?: { id: string | number } | null } }) {
    if (event.canceled || !event.operation.source || !event.operation.target) return
    const sourceId = String(event.operation.source.id)
    const targetId = String(event.operation.target.id)
    if (!sourceId.startsWith("task:") || !targetId.startsWith("column:")) return
    const task = tasks.find((item) => item.id === sourceId.slice("task:".length))
    const status = boardColumns.find((column) => `column:${column.status}` === targetId)?.status
    if (!task || !status || task.status === status) return
    moveTaskMutation.mutate({ ...task, status })
  }

  return (
    <>
      {contextHolder}
      {moveTaskMutation.isError && <Alert className="mb-4" type="error" showIcon message="Task could not be moved" description={moveTaskMutation.error.message} />}
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="grid min-w-70 min-h-115 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {boardColumns.map((column) => (
            <TaskColumn key={column.status} column={column} tasks={tasks.filter((task) => task.status === column.status)} searchQuery={searchQuery} />
          ))}
        </div>
      </DragDropProvider>
    </>
  )
}