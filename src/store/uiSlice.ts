import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export const SIDEBAR_PREFERENCE_KEY = "jiratodo-sidebar-open"

type UiState = {
  sidebarOpen: boolean
  hydrated: boolean
}

const initialState: UiState = {
  sidebarOpen: true,
  hydrated: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    sidebarStateHydrated(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
      state.hydrated = true
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
  },
})

export const { sidebarStateHydrated, setSidebarOpen } = uiSlice.actions
export default uiSlice.reducer
