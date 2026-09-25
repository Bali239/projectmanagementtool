import type { BoardTask, TaskStatus } from "@/store/tasksSlice"
import { getFirebaseAuth } from "@/lib/firebase/client"

type TaskInput = {
  title: string
  description: string
  status: TaskStatus
  dueDate: string
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const user = getFirebaseAuth().currentUser
  if (!user) throw new Error("You must be signed in to manage tasks.")
  const token = await user.getIdToken()
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(body?.error || "The task request failed.")
  }

  return response.status === 204 ? undefined as T : response.json()
}

export function fetchTasks(titleQuery = "") {
  const query = titleQuery.trim()
  return request<BoardTask[]>(query ? `/api/tasks?q=${encodeURIComponent(query)}` : "/api/tasks")
}

export function createTask(input: TaskInput) {
  return request<BoardTask>("/api/tasks", { method: "POST", body: JSON.stringify(input) })
}

export function updateTask(task: BoardTask) {
  const input: TaskInput = { title: task.title, description: task.description, status: task.status, dueDate: task.dueDate }
  return request<BoardTask>(`/api/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify(input) })
}

export function deleteTask(taskId: string) {
  return request<void>(`/api/tasks/${taskId}`, { method: "DELETE" })
}
