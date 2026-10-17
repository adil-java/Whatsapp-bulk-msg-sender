function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getMessageDelayMs(): number {
  return positiveInteger(process.env.MESSAGE_DELAY_MS, 4000);
}

export function parseMessageDelayMs(value: unknown): number {
  if (value === undefined) return getMessageDelayMs();
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 300) {
    throw new Error("Message delay must be a whole number between 1 and 300 seconds.");
  }
  return value * 1000;
}

export function getMaxRecipients(): number {
  return positiveInteger(process.env.MAX_RECIPIENTS, 20);
}
