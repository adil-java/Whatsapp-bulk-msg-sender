import { describe, expect, it } from "vitest";
import { normalizePhoneNumber, parseRecipientInput } from "./phone";

describe("normalizePhoneNumber", () => {
  it("keeps local numbers without adding a country code", () => {
    expect(normalizePhoneNumber("03001234567")).toBe("03001234567");
    expect(normalizePhoneNumber("020 7946 0958")).toBe("02079460958");
    expect(normalizePhoneNumber("415 555 2671")).toBe("4155552671");
  });

  it("accepts formatted international numbers from any country", () => {
    expect(normalizePhoneNumber("+92 300-1234567")).toBe("923001234567");
    expect(normalizePhoneNumber("+1 (415) 555-2671")).toBe("14155552671");
    expect(normalizePhoneNumber("0044 7700 900123")).toBe("447700900123");
    expect(normalizePhoneNumber("971501234567")).toBe("971501234567");
  });

  it("rejects an invalid number", () => {
    expect(() => normalizePhoneNumber("12345")).toThrow("Invalid phone number");
    expect(() => normalizePhoneNumber("+1 CALL-NOW")).toThrow("Invalid phone number");
  });
});

describe("parseRecipientInput", () => {
  it("parses lines and commas and removes duplicates", () => {
    expect(parseRecipientInput("03001234567, 03121234567\n0300-1234567")).toEqual([
      "03001234567",
      "03121234567",
    ]);
  });
});
