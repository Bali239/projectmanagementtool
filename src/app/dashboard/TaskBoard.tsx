"use client"

import { DragDropProvider } from "@dnd-kit/react"
import { Alert } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"
import { updateTaskStatus } from "@/lib/api/tasks"
import { taskQueryKeys } from "@/lib/queryKeys"
import { useAppSelector } from "@/store/hooks"
import type { BoardTask } from "@/store/tasksSlice"
import TaskColumn, { boardColumns } from "./TaskColumn"

type TaskBoardProps = { tasks: BoardTask[]; canManage: boolean; canChangeStatus: boolean }

export default function TaskBoard({ tasks, canManage, canChangeStatus }: TaskBoardProps) {
  const queryClient = useQueryClient()
  const { workspace } = useAuth()
  const searchQuery = useAppSelector((state) => state.tasks.searchQuery)
  const queryKey = taskQueryKeys.list(workspace?.id)
  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: BoardTask["status"] }) => updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousTasks = queryClient.getQueryData<BoardTask[]>(queryKey)
      queryClient.setQueryData<BoardTask[]>(queryKey, (current) => current?.map((task) => task.id === taskId ? { ...task, status } : task))
      return { previousTasks }
    },
    onError: (error, _statusUpdate, context) => {
      if (context?.previousTasks) queryClient.setQueryData(queryKey, context.previousTasks)
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<BoardTask[]>(queryKey, (current) => current?.map((task) => task.id === updatedTask.id ? updatedTask : task))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  function handleDragEnd(event: { canceled: boolean; operation: { source?: { id: string | number } | null; target?: { id: string | number } | null } }) {
    if (!canChangeStatus || event.canceled || !event.operation.source || !event.operation.target) return
    const sourceId = String(event.operation.source.id)
    const targetId = String(event.operation.target.id)
    if (!sourceId.startsWith("task:") || !targetId.startsWith("column:")) return
    const task = tasks.find((item) => item.id === sourceId.slice("task:".length))
    const status = boardColumns.find((column) => `column:${column.status}` === targetId)?.status
    if (!task || !status || task.status === status) return
    moveTaskMutation.mutate({ taskId: task.id, status })
  }

  return (
    <>
      {moveTaskMutation.isError && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message="Task could not be moved"
          description={moveTaskMutation.error.message}
        />
      )}
      <DragDropProvider onDragEnd={handleDragEnd}>
        {/* Removed overflow-x-auto on mobile so it stacks into 2 rows instead of scrolling */}
        <div className="w-full pb-3">
          <div className="grid w-full grid-cols-2 gap-2 items-start lg:grid-cols-4 lg:gap-4">
            {boardColumns.map((column) => (
              <TaskColumn
                key={column.status}
                column={column}
                tasks={tasks.filter((task) => task.status === column.status)}
                searchQuery={searchQuery}
                canManage={canManage}
                canChangeStatus={canChangeStatus}
              />
            ))}
          </div>
        </div>
      </DragDropProvider>
    </>
  )
}
