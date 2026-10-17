import { describe, expect, it } from "vitest";
import { personalizeMessage, RECIPIENT_NAME_TAG } from "./message-template";

describe("personalizeMessage", () => {
  it("fills the recipient name tag from a CSV contact", () => {
    expect(personalizeMessage(`Hello ${RECIPIENT_NAME_TAG}, your order is ready.`, "Ali Khan")).toBe(
      "Hello Ali Khan, your order is ready.",
    );
  });

  it("keeps support for the previous tag and the requested spelling", () => {
    expect(personalizeMessage("Hi {{name}} / {reciptent name}", "Sara")).toBe("Hi Sara / Sara");
  });

  it("uses an empty value when a contact has no name", () => {
    expect(personalizeMessage(`Hello ${RECIPIENT_NAME_TAG}!`)).toBe("Hello !");
  });
});
