"use client"

import { Button, Form, Input } from "antd"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { createWorkspace } from "@/lib/api/workspaces"

type WorkspaceFormValues = { name: string; timezone: string }

export default function WorkspaceOnboarding() {
  const router = useRouter()
  const { refreshWorkspace } = useAuth()
  const [form] = Form.useForm<WorkspaceFormValues>()
  const mutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: async () => {
      await refreshWorkspace()
      router.replace("/dashboard")
    },
  })

  function submit(values: WorkspaceFormValues) {
    mutation.mutate({ name: values.name.trim(), timezone: values.timezone.trim() })
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f4f7f5] px-4 py-10">
      <section className="w-full max-w-xl border-l-4 border-teal-700 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">LetsDo workspace</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Create your workspace</h1>
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
          <Button type="primary" htmlType="submit" size="large" loading={mutation.isPending}>
            Create workspace
          </Button>
        </Form>
      </section>
    </main>
  )
}