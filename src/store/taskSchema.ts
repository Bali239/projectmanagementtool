import { z } from "zod"
import { taskStatuses } from "./tasksSlice"

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Enter a task name.").max(120, "Task names must be 120 characters or fewer."),
  description: z.string().max(10000, "Description is too long."),
  status: z.enum(taskStatuses),
  dueDate: z.union([z.literal(""), z.iso.date()], { error: "Choose a valid due date." }),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export const storedTaskSchema = taskFormSchema.extend({
  id: z.string().min(1),
  createdAt: z.string(),
})
