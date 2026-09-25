import { randomUUID } from "node:crypto"
import { requestErrorResponse, requireUser } from "@/lib/server/auth"
import { database, ensureTaskSchema } from "@/lib/server/db"
import { listTasks, taskInputSchema, toBoardTask } from "@/lib/server/tasks"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const user = await requireUser(request)
    const titleQuery = new URL(request.url).searchParams.get("q") ?? ""
    return Response.json(await listTasks(user.uid, titleQuery))
  } catch (error) {
    return requestErrorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request)
    const parsed = taskInputSchema.safeParse(await request.json())
    if (!parsed.success) return Response.json({ error: "Invalid task", details: parsed.error.flatten() }, { status: 400 })

    await ensureTaskSchema()
    const task = parsed.data
    const id = randomUUID()
    const rows = await database()`INSERT INTO tasks (id, user_id, title, description, status, due_date, due_time)
      VALUES (${id}, ${user.uid}, ${task.title}, ${task.description}, ${task.status}, ${task.dueDate || null}, ${task.dueDate ? task.dueTime || null : null})
      RETURNING id, title, description, status, due_date AS "dueDate", due_time AS "dueTime", created_at AS "createdAt"`

    const row = (rows as unknown as Record<number, Parameters<typeof toBoardTask>[0]>)[0]
    if (!row) return Response.json({ error: "Task was not created" }, { status: 500 })
    return Response.json(toBoardTask(row), { status: 201 })
  } catch (error) {
    return requestErrorResponse(error)
  }
}
