import { normalizePhoneNumber } from "./phone";
import type { Recipient } from "./types";

export type CsvParseResult = {
  recipients: Recipient[];
  errors: string[];
};

const NAME_HEADERS = new Set(["name", "fullname", "displayname", "recipientname", "contactname"]);
const GIVEN_NAME_HEADERS = new Set(["givenname", "firstname"]);
const MIDDLE_NAME_HEADERS = new Set(["additionalname", "middlename"]);
const FAMILY_NAME_HEADERS = new Set(["familyname", "lastname", "surname"]);
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
  const givenNameIndex = headers.findIndex((header) => GIVEN_NAME_HEADERS.has(header));
  const middleNameIndex = headers.findIndex((header) => MIDDLE_NAME_HEADERS.has(header));
  const familyNameIndex = headers.findIndex((header) => FAMILY_NAME_HEADERS.has(header));
  const phoneIndexes = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => PHONE_HEADERS.has(header) || /^phone\d+value$/.test(header))
    .map(({ index }) => index);
  const hasNameColumn = nameIndex !== -1 || givenNameIndex !== -1 || familyNameIndex !== -1;
  if (!hasNameColumn || phoneIndexes.length === 0) {
    throw new Error(
      'CSV must contain a name field and a phone field such as "phone" or Google Contacts "Phone 1 - Value".',
    );
  }

  const recipients = new Map<string, Recipient>();
  const errors: string[] = [];
  for (let index = 1; index < rows.length; index += 1) {
    const fullName = nameIndex === -1 ? "" : rows[index][nameIndex]?.trim() ?? "";
    const nameParts = [givenNameIndex, middleNameIndex, familyNameIndex]
      .filter((columnIndex) => columnIndex !== -1)
      .map((columnIndex) => rows[index][columnIndex]?.trim() ?? "")
      .filter(Boolean);
    const name = fullName || nameParts.join(" ");
    const phoneValues = phoneIndexes.flatMap((phoneIndex) =>
      (rows[index][phoneIndex]?.trim() ?? "")
        .split(/\s*:::\s*/)
        .map((value) => value.trim())
        .filter(Boolean),
    );

    if (phoneValues.length === 0) {
      errors.push(`Row ${index + 1}: phone number is missing.`);
      continue;
    }

    for (const phoneValue of phoneValues) {
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
  }

  if (recipients.size === 0) {
    const details = errors.slice(0, 3).join(" ");
    throw new Error(
      `The CSV does not contain any valid recipients.${details ? ` ${details}` : ""}`,
    );
  }
  return { recipients: [...recipients.values()], errors };
}
