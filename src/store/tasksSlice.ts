import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export const taskStatuses = ["todo", "in-progress", "in-review", "completed"] as const
export type TaskStatus = (typeof taskStatuses)[number]

export type BoardTask = {
  id: string
  title: string
  description: string
  status: TaskStatus
  dueDate: string | null
  dueTime: string | null
  createdAt: string
}

type TasksState = {
  createDialogOpen: boolean
  createStatus: TaskStatus
  activeTaskId: string | null
  taskView: "details" | "edit" | null
  taskEditOrigin: "board" | "details" | null
  searchQuery: string
}

const initialState: TasksState = {
  createDialogOpen: false,
  createStatus: "todo",
  activeTaskId: null,
  taskView: null,
  taskEditOrigin: null,
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
      state.taskEditOrigin = null
    },
    openTaskEdit(state, action: PayloadAction<string>) {
      state.activeTaskId = action.payload
      state.taskView = "edit"
      state.taskEditOrigin = "board"
    },
    editTaskDetails(state) {
      if (state.activeTaskId) {
        state.taskView = "edit"
        state.taskEditOrigin = "details"
      }
    },
    showTaskDetails(state) {
      if (state.activeTaskId) state.taskView = "details"
      state.taskEditOrigin = null
    },
    closeTaskEdit(state) {
      if (state.taskEditOrigin === "details" && state.activeTaskId) {
        state.taskView = "details"
      } else {
        state.activeTaskId = null
        state.taskView = null
      }
      state.taskEditOrigin = null
    },
    closeTaskDetails(state) {
      state.activeTaskId = null
      state.taskView = null
      state.taskEditOrigin = null
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
  openTaskEdit,
  editTaskDetails,
  showTaskDetails,
  closeTaskEdit,
  closeTaskDetails,
  setTaskSearchQuery,
} = tasksSlice.actions
export default tasksSlice.reducer
