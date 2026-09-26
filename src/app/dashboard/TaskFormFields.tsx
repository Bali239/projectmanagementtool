"use client"

import { DatePicker, Form, Input, Select, TimePicker, type FormInstance } from "antd"
import { Editor } from "@tinymce/tinymce-react"
import type { Dayjs } from "dayjs"
import type { TaskStatus } from "@/store/tasksSlice"

export type TaskFormValues = {
  title: string
  status: TaskStatus
  dueDate: Dayjs | null
  dueTime: Dayjs | null
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in-review", label: "In review" },
  { value: "in-progress", label: "Pending" },
  { value: "completed", label: "Completed" },
]

export default function TaskFormFields({ form, description, onDescriptionChange }: {
  form: FormInstance<TaskFormValues>
  description: string
  onDescriptionChange: (value: string) => void
}) {
  const dueDate = Form.useWatch("dueDate", form)

  return (
    <>
      <Form.Item name="title" label="Task title" rules={[{ required: true, whitespace: true, message: "Add a task title" }]}>
        <Input autoFocus size="large" maxLength={180} placeholder="What needs to happen?" />
      </Form.Item>
      <Form.Item label="Description" className="mb-5">
        <div className="overflow-hidden rounded-md border border-slate-200">
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
            value={description}
            onEditorChange={onDescriptionChange}
            init={{
              height: 230,
              menubar: false,
              branding: false,
              promotion: false,
              plugins: "lists link",
              toolbar: "undo redo | blocks | bold italic underline | bullist numlist | link",
              content_style: "body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; color: #334155; padding: 10px 12px; }",
            }}
          />
        </div>
      </Form.Item>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={statusOptions} />
        </Form.Item>
        <Form.Item name="dueDate" label="Due date">
          <DatePicker className="w-full" format="MMM D, YYYY" placeholder="Choose a date" onChange={(value) => { if (!value) form.setFieldValue("dueTime", null) }} />
        </Form.Item>
        <Form.Item name="dueTime" label="Due time">
          <TimePicker className="w-full" format="h:mm A" use12Hours disabled={!dueDate} placeholder="Choose a time" />
        </Form.Item>
      </div>
    </>
  )
}