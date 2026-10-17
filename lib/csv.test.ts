import { describe, expect, it } from "vitest";
import { parseRecipientCsv } from "./csv";

describe("parseRecipientCsv", () => {
  it("reads names and normalized phone numbers", () => {
    const result = parseRecipientCsv('Name,Phone\n"Khan, Ali",03001234567\nSara,+92 312-1234567');
    expect(result.recipients).toEqual([
      { name: "Khan, Ali", phone: "03001234567" },
      { name: "Sara", phone: "923121234567" },
    ]);
    expect(result.errors).toEqual([]);
  });

  it("accepts common header aliases and reports invalid rows", () => {
    const result = parseRecipientCsv("Full Name,Mobile Number\nAli,123\nSara,03331234567");
    expect(result.recipients).toEqual([{ name: "Sara", phone: "03331234567" }]);
    expect(result.errors[0]).toContain("Row 2");
  });

  it("imports Google Contacts names and every phone value", () => {
    const csv = [
      "Name,Given Name,Additional Name,Family Name,Phone 1 - Type,Phone 1 - Value,Phone 2 - Type,Phone 2 - Value",
      "Ali Khan,Ali,,Khan,Mobile,03001234567,Work,03121234567",
      ",Sara,N.,Ahmed,Mobile,03331234567,,",
    ].join("\n");

    expect(parseRecipientCsv(csv).recipients).toEqual([
      { name: "Ali Khan", phone: "03001234567" },
      { name: "Ali Khan", phone: "03121234567" },
      { name: "Sara N. Ahmed", phone: "03331234567" },
    ]);
  });

  it("requires name and phone columns", () => {
    expect(() => parseRecipientCsv("email,address\na@example.com,Home")).toThrow(
      "CSV must contain a name field and a phone field",
    );
  });
});
