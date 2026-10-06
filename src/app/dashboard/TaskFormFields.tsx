"use client"

import { DatePicker, Form, Input, Select, TimePicker, type FormInstance } from "antd"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import dayjs, { type Dayjs } from "dayjs"
import type { TaskStatus } from "@/store/tasksSlice"
import { useAuth } from "@/context/AuthContext"
import { searchWorkspaceMembers, type WorkspaceMember } from "@/lib/api/workspaces"
import { workspaceQueryKeys } from "@/lib/queryKeys"

export type TaskFormValues = {
  title: string
  description: string
  status: TaskStatus
  dueDate: Dayjs | null
  dueTime: Dayjs | null
  assigneeId: string | null
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in-review", label: "In review" },
  { value: "in-progress", label: "Pending" },
  { value: "completed", label: "Completed" },
]

export default function TaskFormFields({ form, currentAssignee }: { form: FormInstance<TaskFormValues>; currentAssignee?: Pick<WorkspaceMember, "id" | "name" | "email"> | null }) {
  const { workspace } = useAuth()
  const [memberSearch, setMemberSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedAssigneeOption, setSelectedAssigneeOption] = useState<{ value: string; label: string } | null>(null)
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(memberSearch.trim()), 500)
    return () => window.clearTimeout(timeout)
  }, [memberSearch])
  const membersQuery = useQuery({
    queryKey: workspaceQueryKeys.memberSearch(workspace?.id, debouncedSearch),
    queryFn: () => searchWorkspaceMembers(debouncedSearch),
    enabled: workspace?.role === "admin" && debouncedSearch.length >= 2,
    staleTime: 30_000,
  })
  const members = membersQuery.data ?? []
  const preservedAssigneeOption = selectedAssigneeOption ?? (currentAssignee
    ? { value: currentAssignee.id, label: `${currentAssignee.name} (${currentAssignee.email})` }
    : null)
  const currentAssigneeOption = preservedAssigneeOption && !members.some(({ id }) => id === preservedAssigneeOption.value)
    ? [preservedAssigneeOption]
    : []
  const memberOptions = [...currentAssigneeOption, ...members.map((member) => ({ value: member.id, label: `${member.name} (${member.email})` }))]
  const dueDate = Form.useWatch("dueDate", form)
  const description = Form.useWatch("description", form) ?? ""

  return (
    <>
      <Form.Item name="description" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="title" label="Task title" rules={[{ required: true, whitespace: true, message: "Add a task title" }]}>
        <Input autoFocus size="large" maxLength={180} placeholder="What needs to happen?" />
      </Form.Item>
      <Form.Item label="Description" className="mb-5">
        <div className="rounded-md border border-slate-200 bg-white">
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
            value={description}
            readonly={false}
            onEditorChange={(value) => form.setFieldValue("description", value)}
            init={{
              height: 230,
              menubar: false,
              branding: false,
              promotion: false,
              plugins: "advlist lists link",
              toolbar: "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | link",
              block_formats: "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Blockquote=blockquote; Preformatted=pre",
              advlist_bullet_styles: "disc,circle,square",
              advlist_number_styles: "decimal,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman",
              link_default_target: "_blank",
              link_default_protocol: "https",
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
          <DatePicker className="w-full" format="MMM D, YYYY" placeholder="Choose a date" disabledDate={(current) => current.isBefore(dayjs(), "day")} onChange={(value) => { if (!value) form.setFieldValue("dueTime", null) }} />
        </Form.Item>
        <Form.Item name="dueTime" label="Due time">
          <TimePicker className="w-full" format="h:mm A" use12Hours disabled={!dueDate} placeholder="Choose a time" />
        </Form.Item>
      </div>
      <Form.Item name="assigneeId" label="Assign to">
        <Select
          showSearch
          allowClear
          filterOption={false}
          onSearch={setMemberSearch}
          loading={membersQuery.isFetching}
          notFoundContent={debouncedSearch.length < 2 ? "Type at least 2 characters" : "No matching team members"}
          placeholder="Search team members by name"
          options={memberOptions}
          onChange={(value: string | undefined) => {
            const member = members.find(({ id }) => id === value)
            if (!value) setSelectedAssigneeOption(null)
            else if (member) setSelectedAssigneeOption({ value: member.id, label: `${member.name} (${member.email})` })
            form.setFieldValue("assigneeId", value ?? null)
          }}
        />
      </Form.Item>
    </>
  )
}
