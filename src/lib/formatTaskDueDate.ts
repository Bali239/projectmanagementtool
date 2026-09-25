export function getTaskDueTimestamp(dueDate: string | null, dueTime: string | null) {
  if (!dueDate) return null

  const datePart = dueDate.match(/^(\d{4}-\d{2}-\d{2})(?:$|[T\s])/i)?.[1]
  if (!datePart) return null

  const timePart = dueTime?.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  const hour = timePart ? Number(timePart[1]) : 23
  const minute = timePart ? Number(timePart[2]) : 59
  const second = timePart ? Number(timePart[3] ?? 0) : 59
  if (hour > 23 || minute > 59 || second > 59) return null

  const date = new Date(`${datePart}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`)
  if (Number.isNaN(date.getTime())) return null
  const [year, month, day] = datePart.split("-").map(Number)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null

  return date.getTime()
}

export function formatTaskDueDate(
  dueDate: string | null,
  dueTime: string | null,
  style: "compact" | "long" = "long",
) {
  const dueTimestamp = getTaskDueTimestamp(dueDate, dueTime)
  if (dueTimestamp === null || !dueDate) return null
  const date = new Date(dueTimestamp)
  const hasValidTime = !!dueTime && /^\d{1,2}:\d{2}(?::\d{2})?$/.test(dueTime)

  const dateLabel = date.toLocaleDateString(undefined, style === "compact"
    ? { month: "short", day: "numeric" }
    : { month: "long", day: "numeric", year: "numeric" })
  const timeLabel = hasValidTime
    ? ` at ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
    : ""

  return `${dateLabel}${timeLabel}`
}
