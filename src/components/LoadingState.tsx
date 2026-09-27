import { Spin } from "antd"

export default function LoadingState({ message, className = "min-h-72" }: { message: string; className?: string }) {
  return <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-3 text-sm text-slate-500 ${className}`}>
    <Spin size="large" />
    <span>{message}</span>
  </div>
}
