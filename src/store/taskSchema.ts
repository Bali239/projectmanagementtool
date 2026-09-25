import { z } from "zod"
import { taskStatuses, type TaskStatus } from "./tasksSlice"

function toStoredText(value: unknown): string {
  if (typeof value === "string") return value
  if (value === null || value === undefined) return ""
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

const freeText = z.unknown().transform(toStoredText)
const freeStatus = z.unknown().transform((value): TaskStatus => (
  typeof value === "string" && taskStatuses.includes(value as TaskStatus) ? value as TaskStatus : "todo"
))

// The form accepts user content as-is; these schemas normalize it to the board's storage shape.
export const taskFormSchema = z.object({
  title: freeText,
  description: freeText,
  status: freeStatus,
  dueDate: freeText,
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export const storedTaskSchema = taskFormSchema.extend({
  id: freeText,
  createdAt: freeText,
})
