"use client"

import { useState } from "react"
import { API_BASE_URL } from "@/lib/api/client"
import { GoogleButton } from "./AuthFormParts"

export default function GoogleAuthFlow({ inviteToken }: { inviteToken?: string }) {
  const [loading, setLoading] = useState(false)

  function beginGoogleLogin() {
    setLoading(true)
    const query = inviteToken ? `?inviteToken=${encodeURIComponent(inviteToken)}` : ""
    window.open(`${API_BASE_URL}/auth/google${query}`, "_self", "noopener,noreferrer")
  }

  return <div>
    <GoogleButton onClick={beginGoogleLogin} loading={loading} />
  </div>
}
