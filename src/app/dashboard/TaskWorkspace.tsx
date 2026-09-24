"use client"

import { Editor } from "@tinymce/tinymce-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, type ReactNode } from "react"
import { Controller, useForm } from "react-hook-form"
import { CalendarDays, Check, ChevronDown, CircleDot, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeCreateTask, taskAdded, tasksHydrated, taskStatuses, type BoardTask, type TaskStatus } from "@/store/tasksSlice"
import { storedTaskSchema, taskFormSchema, type TaskFormValues } from "@/store/taskSchema"
import { SIDEBAR_PREFERENCE_KEY, sidebarStateHydrated } from "@/store/uiSlice"

export const TASK_STORAGE_KEY = "jiratodo-tasks"

function TaskDialog({ initialStatus }: { initialStatus: TaskStatus }) {
  const dispatch = useAppDispatch()
  const close = useCallback(() => dispatch(closeCreateTask()), [dispatch])
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: "", description: "", status: initialStatus, dueDate: "" },
  })

  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") close()
    }
    document.addEventListener("keydown", onEscape)
    return () => document.removeEventListener("keydown", onEscape)
  }, [close])

  function submitTask(values: TaskFormValues) {
    const newTask: BoardTask = {
      ...values,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    dispatch(taskAdded(newTask))
    close()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-task-title" className="flex max-h-[min(850px,94vh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Check className="size-[18px]" /></span>
            <div>
              <p className="text-xs font-medium text-slate-500">JiraTodo / Task</p>
              <h2 id="create-task-title" className="mt-0.5 text-base font-semibold text-slate-900">Create task</h2>
            </div>
          </div>
          <button type="button" onClick={close} aria-label="Close dialog" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><X className="size-4" /></button>
        </header>

        <form onSubmit={handleSubmit(submitTask)} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Task name <span className="text-rose-500">*</span></span>
              <input autoFocus aria-invalid={!!errors.title} {...register("title")} placeholder="What needs to get done?" className="h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 aria-[invalid=true]:border-rose-400" />
              {errors.title && <span role="alert" className="mt-1 block text-xs text-rose-600">{errors.title.message}</span>}
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-800">Description</span>
              <div className="overflow-hidden rounded-lg border border-slate-200 [&_.tox-tinymce]:!border-0 [&_.tox-tinymce]:!rounded-lg [&_.tox-editor-header]:!shadow-none">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      licenseKey="gpl"
                      value={field.value}
                      onEditorChange={field.onChange}
                      onBlur={field.onBlur}
                      init={{
                        base_url: "/tinymce",
                        suffix: ".min",
                        height: 210,
                        menubar: false,
                        statusbar: false,
                        plugins: "lists link",
                        toolbar: "undo redo | blocks | bold italic | bullist numlist | link",
                        toolbar_mode: "sliding",
                        promotion: false,
                        branding: false,
                        content_css: "/tinymce/skins/content/default/content.min.css",
                        skin_url: "/tinymce/skins/ui/oxide",
                        placeholder: "Add context, acceptance criteria, or notes...",
                      }}
                    />
                  )}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">Add details to help your team understand the task.</p>
              {errors.description && <p role="alert" className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Status</span>
                <span className="relative block">
                  <CircleDot className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-indigo-500" />
                  <select {...register("status")} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100">
                    {taskStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </span>
                {errors.status && <span role="alert" className="mt-1 block text-xs text-rose-600">{errors.status.message}</span>}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Due date</span>
                <span className="relative block">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input type="date" {...register("dueDate")} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" />
                </span>
                {errors.dueDate && <span role="alert" className="mt-1 block text-xs text-rose-600">{errors.dueDate.message}</span>}
              </label>
            </div>
          </div>

          <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-7">
            <p className="hidden text-xs text-slate-400 sm:block">You can change status at any time.</p>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={close} className="h-9 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200/70">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true" className="text-lg font-normal leading-none">+</span> Create task</button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  )
}

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  "in-review": "In review",
  completed: "Completed",
  "due-date": "Due date",
}

export function TaskWorkspaceProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const { items: tasks, hydrated, createDialogOpen, createStatus } = useAppSelector((state) => state.tasks)
  const { sidebarOpen, hydrated: sidebarHydrated } = useAppSelector((state) => state.ui)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TASK_STORAGE_KEY)
      if (!stored) {
        dispatch(tasksHydrated([]))
        return
      }
      const parsed: unknown = JSON.parse(stored)
      const result = Array.isArray(parsed) ? storedTaskSchema.array().safeParse(parsed) : null
      dispatch(tasksHydrated(result?.success ? result.data : []))
    } catch {
      dispatch(tasksHydrated([]))
    }
  }, [dispatch])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY)
      dispatch(sidebarStateHydrated(stored === null ? true : stored === "true"))
    } catch {
      dispatch(sidebarStateHydrated(true))
    }
  }, [dispatch])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks))
  }, [hydrated, tasks])

  useEffect(() => {
    if (sidebarHydrated) {
      const value = String(sidebarOpen)
      window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, value)
      document.cookie = `${SIDEBAR_PREFERENCE_KEY}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`
    }
  }, [sidebarHydrated, sidebarOpen])

  return (
    <>
      {children}
      {createDialogOpen && <TaskDialog key={createStatus} initialStatus={createStatus} />}
    </>
  )
}
