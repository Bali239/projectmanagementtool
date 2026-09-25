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
  createDialogOpen: boolean
  createStatus: TaskStatus
  activeTaskId: string | null
  taskView: "details" | "edit" | null
  searchQuery: string
}

const initialState: TasksState = {
  createDialogOpen: false,
  createStatus: "todo",
  activeTaskId: null,
  taskView: null,
  searchQuery: "",
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    openCreateTask(state, action: PayloadAction<TaskStatus>) {
      state.createDialogOpen = true
      state.createStatus = action.payload
    },
    closeCreateTask(state) {
      state.createDialogOpen = false
    },
    openTaskDetails(state, action: PayloadAction<string>) {
      state.activeTaskId = action.payload
      state.taskView = "details"
    },
    editTaskDetails(state) {
      if (state.activeTaskId) state.taskView = "edit"
    },
    showTaskDetails(state) {
      if (state.activeTaskId) state.taskView = "details"
    },
    closeTaskDetails(state) {
      state.activeTaskId = null
      state.taskView = null
    },
    setTaskSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
  },
})

export const {
  openCreateTask,
  closeCreateTask,
  openTaskDetails,
  editTaskDetails,
  showTaskDetails,
  closeTaskDetails,
  setTaskSearchQuery,
} = tasksSlice.actions
export default tasksSlice.reducer
