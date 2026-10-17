export function parseFutureSchedule(value: unknown, now = new Date()): Date {
  if (typeof value !== "string" || !value) {
    throw new Error("A schedule date and time are required.");
  }

  const scheduledAt = new Date(value);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("The scheduled date and time are invalid.");
  }
  if (scheduledAt.getTime() <= now.getTime()) {
    throw new Error("Scheduled time must be in the future.");
  }

  return scheduledAt;
}

