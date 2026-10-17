const MIN_INTERNATIONAL_DIGITS = 7;
const MAX_INTERNATIONAL_DIGITS = 15;

export function normalizePhoneNumber(
  value: string,
): string {
  const input = value.trim();
  const compact = input.replace(/[\s\-().]/g, "");
  const digits = compact.startsWith("+")
    ? compact.slice(1)
    : compact.startsWith("00")
      ? compact.slice(2)
      : compact;

  if (!/^\d+$/.test(digits)) {
    throw new Error(`Invalid phone number: ${input || "empty value"}`);
  }

  if (
    digits.length < MIN_INTERNATIONAL_DIGITS ||
    digits.length > MAX_INTERNATIONAL_DIGITS
  ) {
    throw new Error(`Invalid phone number: ${input || "empty value"}`);
  }

  return digits;
}

export function parseRecipientInput(input: string): string[] {
  const values = input
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set(values.map((value) => normalizePhoneNumber(value)))];
}
