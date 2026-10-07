import { endOfDay, format, isValid, parse, parseISO, set } from "date-fns"

/** Formats a task deadline for the compact card or full detail view. */
export function formatTaskDueDate(
  dueDate: string | null,
  dueTime: string | null,
  style: "compact" | "long" = "long",
) {
  if (!dueDate) return null

  const parsedDate = parseISO(dueDate)
  if (!isValid(parsedDate)) return null

  let date = parsedDate
  let hasValidTime = false
  if (dueTime) {
    const timeParts = dueTime.split(":")
    if (timeParts.length !== 2 && timeParts.length !== 3) return null

    const parsedTime = parse(dueTime, timeParts.length === 3 ? "H:mm:ss" : "H:mm", new Date())
    if (!isValid(parsedTime)) return null

    date = set(parsedDate, {
      hours: parsedTime.getHours(),
      minutes: parsedTime.getMinutes(),
      seconds: parsedTime.getSeconds(),
      milliseconds: 0,
    })
    hasValidTime = true
  } else {
    // Treat date-only deadlines as lasting through the end of that day.
    date = endOfDay(parsedDate)
  }

  const dateLabel = format(date, style === "compact" ? "MMM d" : "MMMM d, yyyy")
  const timeLabel = hasValidTime
    ? ` at ${format(date, "h:mm aa")}`
    : ""

  return `${dateLabel}${timeLabel}`
}
