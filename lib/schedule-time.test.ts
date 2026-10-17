import { describe, expect, it } from "vitest";
import { parseFutureSchedule } from "./schedule-time";

const now = new Date("2026-10-17T10:00:00.000Z");

describe("parseFutureSchedule", () => {
  it("accepts a future ISO timestamp", () => {
    expect(parseFutureSchedule("2026-10-18T10:00:00.000Z", now).toISOString()).toBe(
      "2026-10-18T10:00:00.000Z",
    );
  });

  it("rejects a past timestamp", () => {
    expect(() => parseFutureSchedule("2026-10-16T10:00:00.000Z", now)).toThrow(
      "Scheduled time must be in the future",
    );
  });

  it("rejects an invalid timestamp", () => {
    expect(() => parseFutureSchedule("not-a-date", now)).toThrow(
      "scheduled date and time are invalid",
    );
  });
});

