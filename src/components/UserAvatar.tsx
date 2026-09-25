"use client"

import Image from "next/image"
import { useState } from "react"
import type { AuthUser } from "@/store/authSlice"

type UserAvatarProps = {
  user: AuthUser | null
  size?: "sm" | "md"
}

export function UserAvatar({ user, size = "sm" }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const initials = user?.displayName?.trim().slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "JD"
  const sizeClass = size === "md" ? "size-9" : "size-8"
  const textClass = size === "md" ? "text-xs" : "text-[11px]"
  const label = user?.displayName || user?.email || "User"

  return (
    <span className={`relative flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-indigo-500 to-violet-600 ${textClass} font-bold text-white ring-2 ring-white`}>
      {user?.photoURL && !imageError ? (
        <Image
          src={user.photoURL}
          alt={`${label} avatar`}
          fill
          sizes={size === "md" ? "36px" : "32px"}
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : initials}
    </span>
  )
}