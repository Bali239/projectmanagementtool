import { getFirebaseAdminAuth } from "@/lib/firebase/admin"

export class UnauthorizedError extends Error {}

export async function requireUser(request: Request) {
  const authorization = request.headers.get("authorization")
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null

  if (!token) throw new UnauthorizedError("Missing bearer token")

  try {
    return await getFirebaseAdminAuth().verifyIdToken(token)
  } catch {
    throw new UnauthorizedError("Invalid bearer token")
  }
}

export function requestErrorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: "Authentication required" }, { status: 401 })
  }

  console.error("Authenticated request failed", error)
  return Response.json({ error: "Internal server error" }, { status: 500 })
}