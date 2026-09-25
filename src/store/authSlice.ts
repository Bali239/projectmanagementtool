import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type AuthUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

type AuthState = {
  user: AuthUser | null
  status: "loading" | "authenticated" | "unauthenticated"
}

const initialState: AuthState = {
  user: null,
  status: "loading",
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authLoading(state) {
      state.status = "loading"
    },
    authUserChanged(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
      state.status = action.payload ? "authenticated" : "unauthenticated"
    },
  },
})

export const { authLoading, authUserChanged } = authSlice.actions
export default authSlice.reducer