import { describe, expect, it } from "vitest";
import { parseRecipientCsv } from "./csv";

describe("parseRecipientCsv", () => {
  it("reads names and normalized phone numbers", () => {
    const result = parseRecipientCsv('Name,Phone\n"Khan, Ali",03001234567\nSara,+92 312-1234567');
    expect(result.recipients).toEqual([
      { name: "Khan, Ali", phone: "923001234567" },
      { name: "Sara", phone: "923121234567" },
    ]);
    expect(result.errors).toEqual([]);
  });

  it("accepts common header aliases and reports invalid rows", () => {
    const result = parseRecipientCsv("Full Name,Mobile Number\nAli,123\nSara,03331234567");
    expect(result.recipients).toEqual([{ name: "Sara", phone: "923331234567" }]);
    expect(result.errors[0]).toContain("Row 2");
  });

  it("requires name and phone columns", () => {
    expect(() => parseRecipientCsv("email,address\na@example.com,Home")).toThrow(
      'CSV must contain "name" and "phone"',
    );
  });
});

