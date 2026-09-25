export function formatTaskDueDate(
  dueDate: string | null,
  dueTime: string | null,
  style: "compact" | "long" = "long",
) {
  if (!dueDate) return null

  // Some database drivers return DATE values with a midnight/time suffix.
  // Use the calendar portion for local date formatting and keep the optional
  // time in its separate field when it is available.
  const datePart = dueDate.match(/^(\d{4}-\d{2}-\d{2})(?:$|[T\s])/i)?.[1]
  const date = datePart
    ? new Date(`${datePart}T00:00:00`)
    : new Date(dueDate)
  if (Number.isNaN(date.getTime())) return null
  if (datePart) {
    const [year, month, day] = datePart.split("-").map(Number)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  }

  const timeMatch = dueTime?.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  const timeParts = timeMatch?.slice(1).map((part) => part === undefined ? 0 : Number(part))
  const isValidTime = timeParts && timeParts[0] <= 23 && timeParts[1] <= 59 && (timeParts[2] ?? 0) <= 59
  const timeDate = timeMatch && isValidTime
    ? new Date(`${datePart ?? date.toISOString().slice(0, 10)}T${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}:${timeMatch[3] ?? "00"}`)
    : null
  const validTime = timeDate && !Number.isNaN(timeDate.getTime()) ? timeDate : null

  const dateLabel = date.toLocaleDateString(undefined, style === "compact"
    ? { month: "short", day: "numeric" }
    : { month: "long", day: "numeric", year: "numeric" })
  const timeLabel = validTime
    ? ` at ${validTime.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
    : ""

  return `${dateLabel}${timeLabel}`
}
