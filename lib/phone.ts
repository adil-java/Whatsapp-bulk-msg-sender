const MIN_INTERNATIONAL_DIGITS = 7;
const MAX_INTERNATIONAL_DIGITS = 15;

function unwrapSpreadsheetText(value: string): string {
  const input = value.trim();
  if (input.startsWith('="') && input.endsWith('"')) return input.slice(2, -1).trim();
  if (input.startsWith("'")) return input.slice(1).trim();
  return input;
}

function expandScientificInteger(value: string): string {
  const match = value.match(/^(\+|-)?(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/);
  if (!match) return value;
  if (match[1] === "-") throw new Error(`Invalid phone number: ${value}`);

  const integerPart = match[2];
  const fractionPart = match[3] ?? "";
  const exponent = Number(match[4]);
  const digits = `${integerPart}${fractionPart}`;
  const decimalIndex = integerPart.length + exponent;

  if (decimalIndex <= 0) throw new Error(`Invalid phone number: ${value}`);
  if (decimalIndex < digits.length) {
    if (/[^0]/.test(digits.slice(decimalIndex))) {
      throw new Error(`Invalid phone number: ${value}`);
    }
    return digits.slice(0, decimalIndex);
  }

  return digits.padEnd(decimalIndex, "0");
}

export function normalizePhoneNumber(value: string): string {
  const input = unwrapSpreadsheetText(value);
  const decimalInteger = input.match(/^(\+?\d+)\.0+$/)?.[1] ?? input;
  const expanded = expandScientificInteger(decimalInteger);
  const withoutOptionalTrunk = /^(?:\+|00)/.test(expanded)
    ? expanded.replace("(0)", "")
    : expanded;
  const compact = withoutOptionalTrunk.replace(/[\s\-()./,]/g, "");
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
