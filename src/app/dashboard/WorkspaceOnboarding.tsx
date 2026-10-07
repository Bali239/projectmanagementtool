"use client"

import { useEffect, useState } from "react"
import { Avatar, Button, Form, Input } from "antd"
import { useMutation } from "@tanstack/react-query"
import { createWorkspace, type WorkspaceSummary } from "@/lib/api/workspaces"

type WorkspaceFormValues = { name: string }
type WorkspaceOnboardingProps = {
  onCreated: (workspace: WorkspaceSummary) => void | Promise<void>
  onCancel: () => void
}

export default function WorkspaceOnboarding({ onCreated, onCancel }: WorkspaceOnboardingProps) {
  const [form] = Form.useForm<WorkspaceFormValues>()
  const [photo, setPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: async ({ workspace }) => {
      await onCreated(workspace)
    },
  })

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(photo)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo])

  function submit(values: WorkspaceFormValues) {
    mutation.mutate({ name: values.name.trim(), photo: photo || undefined })
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
          onFinish={submit}
        >
          <Form.Item name="name" label="Workspace name" rules={[{ required: true, whitespace: true, min: 2, max: 100 }]}>
            <Input size="large" autoComplete="organization" placeholder="e.g. Product team" maxLength={100} />
          </Form.Item>
          <div className="mb-5 flex items-center gap-4">
            <Avatar shape="square" size={56} src={previewUrl || undefined} className="shrink-0 bg-teal-50 text-teal-800">
              {form.getFieldValue("name")?.trim().slice(0, 1).toUpperCase() || "W"}
            </Avatar>
            <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">
              <span className="mb-1 block">Workspace photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => setPhoto(event.currentTarget.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-800 hover:file:bg-teal-100"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">Optional. JPEG, PNG, WebP, or GIF; up to 5 MB.</span>
            </label>
          </div>
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
