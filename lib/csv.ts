import { normalizePhoneNumber } from "./phone";
import type { Recipient } from "./types";

export type CsvParseResult = {
  recipients: Recipient[];
  errors: string[];
};

const NAME_HEADERS = new Set(["name", "fullname", "recipientname", "contactname"]);
const PHONE_HEADERS = new Set([
  "phone",
  "phonenumber",
  "number",
  "mobile",
  "mobilenumber",
  "whatsapp",
  "whatsappnumber",
]);

function headerKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const source = content.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export function parseRecipientCsv(content: string): CsvParseResult {
  const rows = parseRows(content);
  if (rows.length === 0) throw new Error("The CSV file is empty.");

  const headers = rows[0].map(headerKey);
  const nameIndex = headers.findIndex((header) => NAME_HEADERS.has(header));
  const phoneIndex = headers.findIndex((header) => PHONE_HEADERS.has(header));
  if (nameIndex === -1 || phoneIndex === -1) {
    throw new Error('CSV must contain "name" and "phone" (or "number") columns.');
  }

  const recipients = new Map<string, Recipient>();
  const errors: string[] = [];
  for (let index = 1; index < rows.length; index += 1) {
    const name = rows[index][nameIndex]?.trim() ?? "";
    const phoneValue = rows[index][phoneIndex]?.trim() ?? "";
    if (!phoneValue) {
      errors.push(`Row ${index + 1}: phone number is missing.`);
      continue;
    }

    try {
      const phone = normalizePhoneNumber(phoneValue);
      const existing = recipients.get(phone);
      if (!existing || (!existing.name && name)) {
        recipients.set(phone, { phone, ...(name ? { name } : {}) });
      }
    } catch (error) {
      errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (recipients.size === 0) throw new Error("The CSV does not contain any valid recipients.");
  return { recipients: [...recipients.values()], errors };
}
