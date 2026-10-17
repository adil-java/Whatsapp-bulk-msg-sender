const PAKISTAN_LOCAL_PATTERN = /^03\d{9}$/;
const PAKISTAN_INTERNATIONAL_PATTERN = /^923\d{9}$/;

export function normalizePhoneNumber(value: string): string {
  const digits = value.replace(/[+\s\-()]/g, "");

  if (PAKISTAN_LOCAL_PATTERN.test(digits)) {
    return `92${digits.slice(1)}`;
  }

  if (PAKISTAN_INTERNATIONAL_PATTERN.test(digits)) {
    return digits;
  }

  throw new Error(`Invalid Pakistan phone number: ${value.trim() || "empty value"}`);
}

export function parseRecipientInput(input: string): string[] {
  const values = input
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set(values.map(normalizePhoneNumber))];
}

