import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  if (!request.headers.get("authorization")?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/tasks/:path*",
}