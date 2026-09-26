"use client"

import { Editor } from "@tinymce/tinymce-react"
import { DatePicker, TimePicker } from "antd"
import dayjs from "dayjs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LoaderCircle, X } from "lucide-react"
import { FormEvent, useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { createTask } from "@/lib/api/tasks"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeCreateTask, taskStatuses, type TaskStatus } from "@/store/tasksSlice"
import { UserAvatar } from "@/components/UserAvatar"

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  "in-review": "In review",
  completed: "Completed",
}

export default function CreateTaskForm() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const createStatus = useAppSelector((state) => state.tasks.createStatus)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>(createStatus)
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [dueTime, setDueTime] = useState<string | null>(null)

  useEffect(() => setStatus(createStatus), [createStatus])

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      dispatch(closeCreateTask())
      setTitle("")
      setDescription("")
      setDueDate(null)
      setDueTime(null)
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    mutation.mutate({ title, description, status, dueDate, dueTime })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="create-task-title">
      {/* Changed 100vh to 100dvh for better mobile browser height handling */}
      <div className="flex max-h-[min(760px,calc(100dvh-2rem))] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        
        <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
          <UserAvatar user={user} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">New work item</p>
            <h2 id="create-task-title" className="truncate text-base sm:text-lg font-bold tracking-tight text-slate-900">Create a task</h2>
          </div>
          <button type="button" onClick={() => dispatch(closeCreateTask())} aria-label="Close create task" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <X className="size-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6">
          <label htmlFor="task-title" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Task title</label>
          <input id="task-title" autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to happen?" className="mb-5 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100" />

          <div className="mb-5 overflow-hidden rounded-lg border border-slate-200">
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              value={description}
              onEditorChange={setDescription}
              init={{
                height: 280,
                menubar: false,
                branding: false,
                promotion: false,
                plugins: "lists link",
                toolbar: "undo redo | blocks | bold italic underline | bullist numlist | link",
                content_style: "body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; color: #334155; padding: 10px 12px; }",
              }}
            />
          </div>

          {/* Adjusted Grid: 1 col on mobile, 2 cols on small tablet, 3 cols on large tablet/desktop */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                {taskStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Due date<DatePicker value={dueDate ? dayjs(dueDate) : null} onChange={(value) => { setDueDate(value?.format("YYYY-MM-DD") ?? null); if (!value) setDueTime(null) }} format="MMM D, YYYY" placeholder="Choose a date" className="!h-11 !w-full !rounded-lg" /></label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Due time<TimePicker value={dueTime ? dayjs(`2000-01-01T${dueTime}`) : null} onChange={(value) => setDueTime(value?.format("HH:mm") ?? null)} use12Hours format="h:mm A" placeholder="Choose a time" disabled={!dueDate} className="!h-11 !w-full !rounded-lg" /></label>
          </div>

          {mutation.isError && <p className="mt-4 text-sm text-red-600">{mutation.error.message}</p>}

          {/* Adjusted Footer: Stacked buttons on mobile, row right-aligned on tablet+ */}
          <footer className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => dispatch(closeCreateTask())} className="h-11 sm:h-10 w-full sm:w-auto rounded-lg px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 flex items-center justify-center">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="inline-flex h-11 sm:h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
              {mutation.isPending && <LoaderCircle className="size-4 animate-spin" />}
              {mutation.isPending ? "Creating..." : "Create task"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}