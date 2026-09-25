import { requestErrorResponse, requireUser } from "@/lib/server/auth"
import { database, ensureTaskSchema } from "@/lib/server/db"
import { taskInputSchema, toBoardTask } from "@/lib/server/tasks"

export const runtime = "nodejs"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request)
    const { id } = await params
    const parsed = taskInputSchema.safeParse(await request.json())
    if (!parsed.success) return Response.json({ error: "Invalid task", details: parsed.error.flatten() }, { status: 400 })

    await ensureTaskSchema()
    const task = parsed.data
    const rows = await database()`UPDATE tasks SET title = ${task.title}, description = ${task.description}, status = ${task.status}, due_date = ${task.dueDate || null}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.uid}
      RETURNING id, title, description, status, due_date AS "dueDate", created_at AS "createdAt"`
    const updatedRow = (rows as unknown as Record<number, Parameters<typeof toBoardTask>[0]>)[0]
    if (!updatedRow) return Response.json({ error: "Task not found" }, { status: 404 })

    return Response.json(toBoardTask(updatedRow))
  } catch (error) {
    return requestErrorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request)
    const { id } = await params
    await ensureTaskSchema()
    const rows = await database()`DELETE FROM tasks WHERE id = ${id} AND user_id = ${user.uid} RETURNING id`
    const deletedRow = (rows as unknown as Record<number, { id: string }>)[0]
    if (!deletedRow) return Response.json({ error: "Task not found" }, { status: 404 })
    return new Response(null, { status: 204 })
  } catch (error) {
    return requestErrorResponse(error)
  }
}