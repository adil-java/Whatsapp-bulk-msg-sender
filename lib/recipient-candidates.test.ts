import { describe, expect, it } from "vitest";
import { recipientNumberCandidates } from "./recipient-candidates";

describe("recipientNumberCandidates", () => {
  it("tries a leading-zero local number with the connected account country first", () => {
    expect(recipientNumberCandidates("03192900498", "92")).toEqual([
      "923192900498",
      "03192900498",
    ]);
  });

  it("keeps an international number first and avoids duplicates", () => {
    expect(recipientNumberCandidates("14155552671", "92")).toEqual([
      "14155552671",
      "9214155552671",
    ]);
    expect(recipientNumberCandidates("923192900498", "92")).toEqual(["923192900498"]);
  });

  it("uses the original number when the account country is unavailable", () => {
    expect(recipientNumberCandidates("03192900498", "")).toEqual(["03192900498"]);
  });
});
