function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getMessageDelayMs(): number {
  return positiveInteger(process.env.MESSAGE_DELAY_MS, 4000);
}

export function getMaxRecipients(): number {
  return positiveInteger(process.env.MAX_RECIPIENTS, 20);
}

