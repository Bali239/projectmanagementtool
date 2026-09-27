export function getFriendlyErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : ""

  if (message.includes("network") || message.includes("fetch")) {
    return "We couldn’t connect. Check your internet connection and try again."
  }
  if (message.includes("unauthorized") || message.includes("session")) {
    return "Your session may have expired. Sign in again and retry."
  }
  return "Something went wrong while loading your workspace. Please try again."
}
