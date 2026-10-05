"use client"

import { Button, Form, Input } from "antd"
import { useMutation } from "@tanstack/react-query"
import { createWorkspace, type WorkspaceSummary } from "@/lib/api/workspaces"

type WorkspaceFormValues = { name: string; timezone: string }
type WorkspaceOnboardingProps = {
  onCreated: (workspace: WorkspaceSummary) => void | Promise<void>
  onCancel: () => void
}

export default function WorkspaceOnboarding({ onCreated, onCancel }: WorkspaceOnboardingProps) {
  const [form] = Form.useForm<WorkspaceFormValues>()
  const mutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: async ({ workspace }) => {
      await onCreated(workspace)
    },
  })

  function submit(values: WorkspaceFormValues) {
    mutation.mutate({ name: values.name.trim(), timezone: values.timezone.trim() })
  }

  return (
    <section>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">LetsDo workspace</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Create your workspace</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Set up your team space. You’ll be its admin and can invite people from the Team page.</p>
        <Form
          form={form}
          layout="vertical"
          className="mt-7"
          initialValues={{ timezone: "UTC" }}
          onFinish={submit}
        >
          <Form.Item name="name" label="Workspace name" rules={[{ required: true, whitespace: true, min: 2, max: 100 }]}>
            <Input size="large" autoComplete="organization" placeholder="e.g. Product team" maxLength={100} />
          </Form.Item>
          <Form.Item name="timezone" label="Workspace timezone" rules={[{ required: true }]}>
            <Input size="large" placeholder="America/New_York" />
          </Form.Item>
          {mutation.error && <p role="alert" className="mb-4 text-sm text-red-700">{mutation.error.message}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="primary" htmlType="submit" size="large" loading={mutation.isPending}>
              Create workspace
            </Button>
            <Button size="large" onClick={onCancel} disabled={mutation.isPending}>Cancel</Button>
          </div>
        </Form>
    </section>
  )
}