import { describe, expect, it } from "vitest";
import { normalizeRecipientList } from "./recipients";

describe("normalizeRecipientList", () => {
  it("supports manual strings and CSV-shaped recipient objects", () => {
    expect(
      normalizeRecipientList(["03001234567", { name: "Sara", phone: "+92 312-1234567" }], 20),
    ).toEqual([
      { phone: "923001234567" },
      { name: "Sara", phone: "923121234567" },
    ]);
  });

  it("deduplicates by phone and keeps a supplied name", () => {
    expect(
      normalizeRecipientList(["03001234567", { name: "Ali", phone: "923001234567" }], 20),
    ).toEqual([{ name: "Ali", phone: "923001234567" }]);
  });

  it("enforces the demo recipient limit", () => {
    expect(() => normalizeRecipientList(["03001234567", "03121234567"], 1)).toThrow(
      "maximum of 1 recipient",
    );
  });
});
