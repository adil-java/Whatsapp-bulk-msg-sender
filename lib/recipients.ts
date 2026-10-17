import { normalizePhoneNumber } from "./phone";
import type { Recipient } from "./types";

export function normalizeRecipientList(value: unknown, maximum: number): Recipient[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("At least one recipient is required.");
  }
  if (value.length > maximum) {
    throw new Error(`Demo supports a maximum of ${maximum} recipients.`);
  }

  const recipients = value.map((entry, index) => {
    if (typeof entry === "string") {
      return { phone: normalizePhoneNumber(entry) };
    }
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`Recipient ${index + 1} must contain a phone number.`);
    }

    const candidate = entry as { phone?: unknown; name?: unknown };
    if (typeof candidate.phone !== "string") {
      throw new Error(`Recipient ${index + 1} must contain a phone number.`);
    }
    if (candidate.name !== undefined && typeof candidate.name !== "string") {
      throw new Error(`Recipient ${index + 1} has an invalid name.`);
    }

    const name = candidate.name?.trim();
    return {
      phone: normalizePhoneNumber(candidate.phone),
      ...(name ? { name } : {}),
    };
  });

  const unique = new Map<string, Recipient>();
  for (const recipient of recipients) {
    const existing = unique.get(recipient.phone);
    if (!existing || (!existing.name && recipient.name)) unique.set(recipient.phone, recipient);
  }
  return [...unique.values()];
}
