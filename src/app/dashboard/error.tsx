"use client"

import { useEffect, useRef } from "react"
import { Button, message } from "antd"
import { getFriendlyErrorMessage } from "@/lib/friendlyError"

export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const [messageApi, contextHolder] = message.useMessage()
  const notifiedError = useRef<Error | null>(null)
  const friendlyMessage = getFriendlyErrorMessage(error)

  useEffect(() => {
    if (notifiedError.current === error) return
    notifiedError.current = error
    messageApi.error(friendlyMessage)
  }, [error, friendlyMessage, messageApi])

  return <main className="flex min-h-72 items-center justify-center px-5 py-12">
    {contextHolder}
    <section role="alert" className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">We couldn’t open your workspace</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{friendlyMessage}</p>
      <Button type="primary" className="mt-6" onClick={retry}>Try again</Button>
    </section>
  </main>
}
