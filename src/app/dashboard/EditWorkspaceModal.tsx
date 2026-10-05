"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Alert, Avatar, Button, Form, Input, Modal } from "antd"
import { ImagePlus } from "lucide-react"
import { updateWorkspace, type WorkspaceSummary } from "@/lib/api/workspaces"

type WorkspaceFormValues = { name: string }

type EditWorkspaceModalProps = {
  open: boolean
  workspace: WorkspaceSummary
  onCancel: () => void
  onSaved: () => void | Promise<void>
}

export default function EditWorkspaceModal({ open, workspace, onCancel, onSaved }: EditWorkspaceModalProps) {
  const [form] = Form.useForm<WorkspaceFormValues>()
  const [photo, setPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(workspace.photoUrl)
  const mutation = useMutation({
    mutationFn: (input: { name?: string; photo?: File }) => updateWorkspace(workspace.id, input),
    onSuccess: async () => {
      onCancel()
      await onSaved()
    },
  })

  useEffect(() => {
    if (!open) return
    form.setFieldsValue({ name: workspace.name })
    setPhoto(null)
    setPreviewUrl(workspace.photoUrl)
  }, [form, open, workspace])

  useEffect(() => {
    if (!photo) return
    const objectUrl = URL.createObjectURL(photo)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo])

  function submit(values: WorkspaceFormValues) {
    mutation.mutate({ name: values.name.trim(), photo: photo || undefined })
  }

  return (
    <Modal open={open} footer={null} onCancel={onCancel} title="Edit workspace" destroyOnHidden>
      <Form form={form} layout="vertical" className="mt-5" onFinish={submit}>
        <Form.Item name="name" label="Workspace name" rules={[{ required: true, whitespace: true, min: 2, max: 100 }]}>
          <Input size="large" maxLength={100} autoComplete="organization" />
        </Form.Item>
        <div className="mb-5 flex items-center gap-4">
          <Avatar shape="square" size={64} src={previewUrl || undefined} className="shrink-0 bg-teal-50 text-teal-800">
            {workspace.name.slice(0, 1).toUpperCase()}
          </Avatar>
          <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">
            <span className="mb-1 block">Workspace photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => setPhoto(event.currentTarget.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-800 hover:file:bg-teal-100"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">JPEG, PNG, WebP, or GIF; up to 5 MB.</span>
          </label>
        </div>
        {mutation.error && <Alert className="mb-4" type="error" showIcon title={mutation.error.message} />}
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} disabled={mutation.isPending}>Cancel</Button>
          <Button type="primary" htmlType="submit" icon={<ImagePlus size={15} />} loading={mutation.isPending}>Save changes</Button>
        </div>
      </Form>
    </Modal>
  )
}