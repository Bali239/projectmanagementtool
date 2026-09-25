"use client"

import type { ReactNode } from "react"
import CreateTaskForm from "./CreateTaskForm"
import TaskDetailsModal from "./TaskDetailsModal"
import { useAppSelector } from "@/store/hooks"

export function TaskWorkspaceProvider({ children }: { children: ReactNode }) {
	const createDialogOpen = useAppSelector((state) => state.tasks.createDialogOpen)

	return (
		<>
			{children}
			{createDialogOpen && <CreateTaskForm />}
			<TaskDetailsModal />
		</>
	)
}
