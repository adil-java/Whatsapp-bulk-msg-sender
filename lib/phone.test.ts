import { describe, expect, it } from "vitest";
import { normalizePhoneNumber, parseRecipientInput } from "./phone";

describe("normalizePhoneNumber", () => {
  it("converts a Pakistan local number", () => {
    expect(normalizePhoneNumber("03001234567")).toBe("923001234567");
  });

  it("cleans a formatted international number", () => {
    expect(normalizePhoneNumber("+92 300-1234567")).toBe("923001234567");
  });

  it("rejects an invalid number", () => {
    expect(() => normalizePhoneNumber("12345")).toThrow("Invalid Pakistan phone number");
  });
});

describe("parseRecipientInput", () => {
  it("parses lines and commas and removes duplicates", () => {
    expect(parseRecipientInput("03001234567, 03121234567\n+92 300-1234567")).toEqual([
      "923001234567",
      "923121234567",
    ]);
  });
});
