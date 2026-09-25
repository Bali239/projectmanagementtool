import { NextResponse, type NextRequest } from "next/server"

const defaultAllowedOrigins = ["https://projectmanagementtool-nine.vercel.app"]

function allowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return null

  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins])

  return origin === request.nextUrl.origin || allowedOrigins.has(origin) ? origin : null
}

function addCorsHeaders(response: NextResponse, origin: string | null) {
  if (!origin) return response

  response.headers.set("Access-Control-Allow-Origin", origin)
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type")
  response.headers.set("Access-Control-Max-Age", "86400")
  response.headers.append("Vary", "Origin")
  return response
}

export function proxy(request: NextRequest) {
  const origin = allowedOrigin(request)

  if (request.method === "OPTIONS") {
    if (!origin) return NextResponse.json({ error: "Origin not allowed" }, { status: 403 })
    return addCorsHeaders(new NextResponse(null, { status: 204 }), origin)
  }

  if (!request.headers.get("authorization")?.startsWith("Bearer ")) {
    return addCorsHeaders(NextResponse.json({ error: "Authentication required" }, { status: 401 }), origin)
  }

  return addCorsHeaders(NextResponse.next(), origin)
}

export const config = {
  matcher: "/api/tasks/:path*",
}
