"use client"

import { Editor } from "@tinymce/tinymce-react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import { CalendarDays, Check, ChevronDown, CircleDot, X } from "lucide-react"

export const TASK_STORAGE_KEY = "jiratodo-tasks"

export type TaskStatus = "todo" | "in-progress" | "in-review" | "completed" | "due-date"

export type BoardTask = {
  id: string
  title: string
  description: string
  status: TaskStatus
  dueDate: string
  createdAt: string
}

type NewTask = Omit<BoardTask, "id" | "createdAt">

type TaskWorkspaceValue = {
  tasks: BoardTask[]
  hydrated: boolean
  openCreateTask: (status?: TaskStatus) => void
  addTask: (task: NewTask) => void
  moveTask: (taskId: string, status: TaskStatus, targetTaskId?: string) => void
}

const TaskWorkspaceContext = createContext<TaskWorkspaceValue | null>(null)

export function useTaskWorkspace() {
  const value = useContext(TaskWorkspaceContext)
  if (!value) throw new Error("useTaskWorkspace must be used inside TaskWorkspaceProvider")
  return value
}

const statusOptions: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "in-progress", label: "In progress" },
  { id: "in-review", label: "In review" },
  { id: "completed", label: "Completed" },
  { id: "due-date", label: "Due date" },
]

function TaskDialog({ onClose, onCreate, initialStatus }: { onClose: () => void; onCreate: (task: NewTask) => void; initialStatus: TaskStatus }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>(initialStatus)
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onEscape)
    return () => document.removeEventListener("keydown", onEscape)
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    onCreate({ title: title.trim(), description, status, dueDate })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-task-title" className="flex max-h-[min(850px,94vh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Check className="size-[18px]" /></span>
            <div>
              <p className="text-xs font-medium text-slate-500">JiraTodo / Task</p>
              <h2 id="create-task-title" className="mt-0.5 text-base font-semibold text-slate-900">Create task</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><X className="size-4" /></button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Task name <span className="text-rose-500">*</span></span>
              <input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to get done?" className="h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" />
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-800">Description</span>
              <div className="overflow-hidden rounded-lg border border-slate-200 [&_.tox-tinymce]:!border-0 [&_.tox-tinymce]:!rounded-lg [&_.tox-editor-header]:!shadow-none">
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  licenseKey="gpl"
                  value={description}
                  onEditorChange={setDescription}
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
              </div>
              <p className="mt-1.5 text-xs text-slate-400">Add details to help your team understand the task.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Status</span>
                <span className="relative block">
                  <CircleDot className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-indigo-500" />
                  <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100">
                    {statusOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Due date</span>
                <span className="relative block">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" />
                </span>
              </label>
            </div>
          </div>

          <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-7">
            <p className="hidden text-xs text-slate-400 sm:block">You can change status at any time.</p>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={onClose} className="h-9 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200/70">Cancel</button>
              <button type="submit" disabled={!title.trim()} className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"><PlusIcon /> Create task</button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  )
}

function PlusIcon() {
  return <span aria-hidden="true" className="text-lg font-normal leading-none">+</span>
}

export function TaskWorkspaceProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<BoardTask[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<TaskStatus>("todo")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TASK_STORAGE_KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (Array.isArray(parsed)) setTasks(parsed as BoardTask[])
      }
    } catch {
      window.localStorage.removeItem(TASK_STORAGE_KEY)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks))
  }, [hydrated, tasks])

  const addTask = useCallback((task: NewTask) => {
    setTasks((current) => [{ ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current])
  }, [])

  const moveTask = useCallback((taskId: string, status: TaskStatus, targetTaskId?: string) => {
    setTasks((current) => {
      const moving = current.find((task) => task.id === taskId)
      if (!moving) return current
      const remaining = current.filter((task) => task.id !== taskId)
      const targetIndex = targetTaskId ? remaining.findIndex((task) => task.id === targetTaskId) : -1
      const lastInColumn = remaining.reduce((last, task, index) => task.status === status ? index : last, -1)
      const insertAt = targetIndex >= 0 ? targetIndex : lastInColumn + 1
      remaining.splice(insertAt, 0, { ...moving, status })
      return remaining
    })
  }, [])

  const openCreateTask = useCallback((status: TaskStatus = "todo") => {
    setCreateStatus(status)
    setDialogOpen(true)
  }, [])
  const value = useMemo(() => ({ tasks, hydrated, openCreateTask, addTask, moveTask }), [tasks, hydrated, openCreateTask, addTask, moveTask])

  return (
    <TaskWorkspaceContext.Provider value={value}>
      {children}
      {dialogOpen && <TaskDialog initialStatus={createStatus} onClose={() => setDialogOpen(false)} onCreate={addTask} />}
    </TaskWorkspaceContext.Provider>
  )
}
