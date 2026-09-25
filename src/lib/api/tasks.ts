import type { BoardTask, TaskStatus } from "@/store/tasksSlice"
import { apiRequest } from "@/lib/api/client"

type TaskInput = {
  title: string
  description: string
  status: TaskStatus
  dueDate: string | null
  dueTime: string | null
}

export function fetchTasks(titleQuery = "") {
  const query = titleQuery.trim()
  return apiRequest<BoardTask[]>(query ? `/tasks?q=${encodeURIComponent(query)}` : "/tasks")
}

export function createTask(input: TaskInput) {
  return apiRequest<BoardTask>("/tasks", { method: "POST", data: input })
}

export function updateTask(task: BoardTask) {
  const input: TaskInput = { title: task.title, description: task.description, status: task.status, dueDate: task.dueDate, dueTime: task.dueTime }
  return apiRequest<BoardTask>(`/tasks/${task.id}`, { method: "PATCH", data: input })
}

export function deleteTask(taskId: string) {
  return apiRequest<void>(`/tasks/${taskId}`, { method: "DELETE" })
}
