import { z } from "zod"
import { database, ensureTaskSchema } from "@/lib/server/db"
import type { BoardTask } from "@/store/tasksSlice"

export const taskStatusSchema = z.enum(["todo", "in-progress", "in-review", "completed", "due-date"])

export const taskInputSchema = z.object({
  title: z.string(),
  description: z.preprocess(
    (value) => typeof value === "string" ? value : "",
    z.string(),
  ),
  status: taskStatusSchema,
  dueDate: z.string().nullable().or(z.literal("")),
  dueTime: z.string().nullable().or(z.literal("")),
})

type TaskRow = {
  id: string
  title: string
  description: string
  status: BoardTask["status"]
  dueDate: string | null
  dueTime: string | null
  createdAt: string | Date
}

export function toBoardTask(row: TaskRow): BoardTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    dueDate: row.dueDate ?? null,
    dueTime: row.dueTime ?? null,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  }
}

export async function listTasks(userId: string, titleQuery = "") {
  await ensureTaskSchema()
  const query = titleQuery.trim()
  const rows = query
    ? await database()`SELECT id, title, description, status, due_date AS "dueDate", due_time AS "dueTime", created_at AS "createdAt"
        FROM tasks WHERE user_id = ${userId} AND title ILIKE ${`%${query}%`} ORDER BY created_at DESC`
    : await database()`SELECT id, title, description, status, due_date AS "dueDate", due_time AS "dueTime", created_at AS "createdAt"
        FROM tasks WHERE user_id = ${userId} ORDER BY created_at DESC`
  const taskRows = rows as unknown as TaskRow[]
  return taskRows.map((row: TaskRow) => toBoardTask(row))
}
