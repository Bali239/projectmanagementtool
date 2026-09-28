"use client"

import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { loginWithGoogle } from "@/lib/firebase/auth"
import { AuthError, GoogleButton } from "./AuthFormParts"

export default function GoogleAuthFlow() {
  const router = useRouter()
  const googleMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: () => router.replace("/dashboard"),
  })

  return <div>
    <GoogleButton onClick={() => googleMutation.mutate()} loading={googleMutation.isPending} />
    <div className="mt-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with email<span className="h-px flex-1 bg-slate-200" /></div>
    {googleMutation.error && <div className="mt-4"><AuthError error={googleMutation.error} /></div>}
  </div>
}
