"use client"

import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/lib/api/client"
import { GoogleButton } from "./AuthFormParts"

export default function GoogleAuthFlow() {
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("authError") !== "google") return

    setFailed(true)
    url.searchParams.delete("authError")
    window.history.replaceState({}, "", url)
  }, [])

  function beginGoogleLogin() {
    setLoading(true)
    window.open(`${API_BASE_URL}/auth/google`, "_self", "noopener,noreferrer")
  }

  return <div>
    <GoogleButton onClick={beginGoogleLogin} loading={loading} />
    {failed && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Google sign-in could not be completed. Please try again.</p>}
  </div>
}
