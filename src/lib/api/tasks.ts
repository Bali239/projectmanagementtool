import type { BoardTask, TaskStatus } from "@/store/tasksSlice"
import { apiRequest, workspaceRequestConfig } from "@/lib/api/client"

// Payload accepted by task create and update endpoints.
type TaskInput = {
  title: string
  description: string
  status: TaskStatus
  dueDate: string | null
  dueTime: string | null
  assigneeId: string | null
}

export type TaskStatusNotification = {
  id: string
  taskTitle: string
  changedBy: string
  fromStatus: TaskStatus
  toStatus: TaskStatus
  createdAt: string
}

// Task API functions return data in the shapes consumed by the client store and queries.
export function fetchTasks(workspaceId?: string, titleQuery = "") {
  const query = titleQuery.trim()
  return apiRequest<BoardTask[]>(
    query ? `/tasks?q=${encodeURIComponent(query)}` : "/tasks",
    workspaceRequestConfig(workspaceId),
  )
}

export function fetchTaskStatusNotifications(workspaceId?: string) {
  return apiRequest<TaskStatusNotification[]>("/tasks/status-notifications", workspaceRequestConfig(workspaceId))
}

export function createTask(input: TaskInput) {
  return apiRequest<BoardTask>("/tasks", { method: "POST", data: input })
}

export function updateTask(task: BoardTask) {
  const input: TaskInput = { title: task.title, description: task.description, status: task.status, dueDate: task.dueDate, dueTime: task.dueTime, assigneeId: task.assigneeId }
  return apiRequest<BoardTask>(`/tasks/${task.id}`, { method: "PATCH", data: input })
}

export function updateTaskStatus(taskId: string, status: TaskStatus) {
  return apiRequest<BoardTask>(`/tasks/${taskId}/status`, {
    method: "PATCH",
    data: { status },
  })
}

export function deleteTask(taskId: string) {
  return apiRequest<void>(`/tasks/${taskId}`, { method: "DELETE" })
}
