import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "./tasksSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
	reducer: {
		app: (state = {}) => state,
		tasks: tasksReducer,
		ui: uiReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
