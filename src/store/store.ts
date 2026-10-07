import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "./tasksSlice";
import uiReducer from "./uiSlice";
import authReducer from "./authSlice";

// Combine feature slices into the application's single Redux store.
export const store = configureStore({
	reducer: {
		app: (state = {}) => state,
		tasks: tasksReducer,
		ui: uiReducer,
		auth: authReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
