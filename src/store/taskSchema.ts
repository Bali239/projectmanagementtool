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

const requiredText = z.preprocess(
  toStoredText,
  z.string().trim().min(1, "This field cannot be empty."),
)
const richText = z.preprocess(
  toStoredText,
  z.string().refine(
    (value) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").trim().length > 0,
    "Description cannot be empty.",
  ),
)
const freeStatus = z.unknown().transform((value): TaskStatus => (
  typeof value === "string" && taskStatuses.includes(value as TaskStatus) ? value as TaskStatus : "todo"
))

// The form accepts user content as-is; these schemas normalize it to the board's storage shape.
export const taskFormSchema = z.object({
  title: requiredText,
  description: richText,
  status: freeStatus,
  dueDate: z.preprocess(toStoredText, z.string()),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

