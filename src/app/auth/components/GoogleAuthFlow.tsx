"use client"

import { useState } from "react"
import { API_BASE_URL } from "@/lib/api/client"
import { GoogleButton } from "./AuthFormParts"

export default function GoogleAuthFlow() {
  const [loading, setLoading] = useState(false)

  function beginGoogleLogin() {
    setLoading(true)
    window.open(`${API_BASE_URL}/auth/google`, "_self", "noopener,noreferrer")
  }

  return <div>
    <GoogleButton onClick={beginGoogleLogin} loading={loading} />
  </div>
}
