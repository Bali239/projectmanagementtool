"use client"

import { Editor } from "@tinymce/tinymce-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, Check, Clock3, Pencil, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { deleteTask, updateTask, fetchTasks } from "@/lib/api/tasks"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeTaskDetails, editTaskDetails, showTaskDetails, taskStatuses, type BoardTask, type TaskStatus } from "@/store/tasksSlice"

const labels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  "in-review": "In review",
  completed: "Completed",
  "due-date": "Due date",
}

export default function TaskDetailsModal() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { activeTaskId, taskView } = useAppSelector((state) => state.tasks)
  const { data: tasks = [], isError, isSuccess, error } = useQuery({ queryKey: ["tasks", user?.uid], queryFn: () => fetchTasks(), enabled: !!user && !!activeTaskId })
  const task = tasks.find((item) => item.id === activeTaskId)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>("todo")
  const [dueDate, setDueDate] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description)
    setStatus(task.status)
    setDueDate(task.dueDate)
  }, [task])

  useEffect(() => {
    if (!activeTaskId) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (confirmDelete) setConfirmDelete(false)
        else dispatch(closeTaskDetails())
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activeTaskId, confirmDelete, dispatch])

  const saveMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: (updated) => {
      queryClient.setQueryData<BoardTask[]>(["tasks", user?.uid], (current = []) => current.map((item) => item.id === updated.id ? updated : item))
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] })
      dispatch(showTaskDetails())
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: (_, taskId) => {
      queryClient.setQueryData<BoardTask[]>(["tasks", user?.uid], (current = []) => current.filter((item) => item.id !== taskId))
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] })
      setConfirmDelete(false)
      dispatch(closeTaskDetails())
    },
  })

  if (!activeTaskId) return null
  const editing = taskView === "edit"

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) dispatch(closeTaskDetails()) }}>
      <section role="dialog" aria-modal="true" aria-labelledby="task-detail-title" className="flex max-h-[min(850px,calc(100vh-1.5rem))] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/25 sm:max-h-[calc(100vh-3rem)]">
        <header className="flex items-start gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Check className="size-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">Task details</p>
            <h2 id="task-detail-title" className="break-words text-xl font-bold tracking-tight text-slate-900">{task?.title ?? (isError ? "Could not load task" : isSuccess ? "Task not found" : "Loading task…")}</h2>
            {task && <p className="mt-1 font-mono text-xs text-slate-400">#{task.id.slice(0, 8)}</p>}
          </div>
          <button type="button" onClick={() => dispatch(closeTaskDetails())} aria-label="Close task details" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-5" /></button>
        </header>

        {task && <>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            {editing ? <div className="space-y-5">
              <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Task title<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-base font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</p>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <Editor tinymceScriptSrc="/tinymce/tinymce.min.js" licenseKey="gpl" value={description} onEditorChange={setDescription} init={{ height: 320, menubar: false, branding: false, promotion: false, plugins: "lists link", toolbar: "undo redo | blocks | bold italic underline | bullist numlist | link", content_style: "body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; color: #334155; padding: 10px 12px; }" }} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status<select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-indigo-400"><option value="todo">To do</option>{taskStatuses.filter((item) => item !== "todo").map((item) => <option key={item} value={item}>{labels[item]}</option>)}</select></label>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-indigo-400" /></label>
              </div>
            </div> : <>
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"><Clock3 className="size-3.5" />{labels[task.status]}</span>
                {task.dueDate && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"><CalendarDays className="size-3.5" />Due {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>}
              </div>
              <div className="mb-2 flex items-center gap-2"><span className="size-1.5 rounded-full bg-indigo-500" /><h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Description</h3></div>
              {task.description.trim() ? <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60 p-1">
                <Editor tinymceScriptSrc="/tinymce/tinymce.min.js" licenseKey="gpl" value={task.description} readonly init={{ height: 360, menubar: false, toolbar: false, statusbar: false, branding: false, promotion: false, content_style: "body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 15px; line-height: 1.75; color: #334155; padding: 16px 20px; } h1,h2,h3 { color: #0f172a; } ul,ol { padding-left: 1.5rem; }" }} />
              </div> : <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">No description was added to this task.</p>}
              <p className="mt-5 text-xs text-slate-400">Created {new Date(task.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
            </>}
            {saveMutation.isError && <p className="mt-4 text-sm text-red-600">{saveMutation.error.message}</p>}
          </div>
          <footer className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
            {editing ? <button type="button" onClick={() => dispatch(showTaskDetails())} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button> : <div className="flex items-center gap-2"><button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-4" />Delete</button><button type="button" onClick={() => dispatch(closeTaskDetails())} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Close</button></div>}
            {editing ? <button type="button" disabled={saveMutation.isPending || !title.trim()} onClick={() => saveMutation.mutate({ ...task, title, description, status, dueDate })} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"><Check className="size-4" />{saveMutation.isPending ? "Saving…" : "Save changes"}</button> : <button type="button" onClick={() => dispatch(editTaskDetails())} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"><Pencil className="size-4" />Edit task</button>}
          </footer>
        </>}
        {!task && <p role={isError ? "alert" : "status"} className={`px-7 py-10 text-center text-sm ${isError ? "text-red-600" : "text-slate-500"}`}>{isError ? error.message : isSuccess ? "This task may have been deleted or is no longer available." : "Loading task details…"}</p>}
      </section>
      {confirmDelete && task && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 p-4" role="presentation">
        <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-delete-title" aria-describedby="confirm-delete-description" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/25">
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600"><Trash2 className="size-5" /></div>
          <h2 id="confirm-delete-title" className="text-lg font-bold tracking-tight text-slate-900">Delete this task?</h2>
          <p id="confirm-delete-description" className="mt-2 text-sm leading-6 text-slate-600">Are you sure you want to delete <span className="font-semibold text-slate-800">{task.title}</span>? This action can’t be undone.</p>
          {deleteMutation.isError && <p className="mt-3 text-sm text-red-600">{deleteMutation.error.message}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" disabled={deleteMutation.isPending} onClick={() => { setConfirmDelete(false); deleteMutation.reset() }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Cancel</button>
            <button type="button" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(task.id)} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"><Trash2 className="size-4" />{deleteMutation.isPending ? "Deleting…" : "Delete task"}</button>
          </div>
        </section>
      </div>}
    </div>
  )
}
