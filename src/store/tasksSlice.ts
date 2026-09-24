import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export const taskStatuses = ["todo", "in-progress", "in-review", "completed", "due-date"] as const
export type TaskStatus = (typeof taskStatuses)[number]

export type BoardTask = {
  id: string
  title: string
  description: string
  status: TaskStatus
  dueDate: string
  createdAt: string
}

type TasksState = {
  items: BoardTask[]
  hydrated: boolean
  createDialogOpen: boolean
  createStatus: TaskStatus
  searchQuery: string
}

const initialState: TasksState = {
  items: [],
  hydrated: false,
  createDialogOpen: false,
  createStatus: "todo",
  searchQuery: "",
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    tasksHydrated(state, action: PayloadAction<BoardTask[]>) {
      state.items = action.payload
      state.hydrated = true
    },
    taskAdded(state, action: PayloadAction<BoardTask>) {
      state.items.unshift(action.payload)
    },
    taskMoved(state, action: PayloadAction<{ taskId: string; status: TaskStatus; targetTaskId?: string }>) {
      const { taskId, status, targetTaskId } = action.payload
      const taskIndex = state.items.findIndex((task) => task.id === taskId)
      if (taskIndex < 0) return

      const [task] = state.items.splice(taskIndex, 1)
      if (!task) return
      const targetIndex = targetTaskId ? state.items.findIndex((item) => item.id === targetTaskId) : -1
      const lastInColumn = state.items.reduce((last, item, index) => item.status === status ? index : last, -1)
      state.items.splice(targetIndex >= 0 ? targetIndex : lastInColumn + 1, 0, { ...task, status })
    },
    openCreateTask(state, action: PayloadAction<TaskStatus>) {
      state.createDialogOpen = true
      state.createStatus = action.payload
    },
    closeCreateTask(state) {
      state.createDialogOpen = false
    },
    setTaskSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
  },
})

export const { tasksHydrated, taskAdded, taskMoved, openCreateTask, closeCreateTask, setTaskSearchQuery } = tasksSlice.actions
export default tasksSlice.reducer
