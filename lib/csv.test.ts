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

  it("supports the Google Contacts first, middle, last, and phone schema", () => {
    const csv = [
      [
        "First Name",
        "Middle Name",
        "Last Name",
        "Phonetic First Name",
        "Phonetic Middle Name",
        "Phonetic Last Name",
        "Name Prefix",
        "Name Suffix",
        "Nickname",
        "File As",
        "Organization Name",
        "Organization Title",
        "Organization Department",
        "Birthday",
        "Notes",
        "Photo",
        "Labels",
        "Phone 1 - Label",
        "Phone 1 - Value",
      ].join(","),
      [
        "Ali",
        "N.",
        "Khan",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Acme",
        "Founder",
        "",
        "",
        "",
        "",
        "Friends",
        "Mobile",
        "+1 415 555 2671",
      ].join(","),
    ].join("\n");

    expect(parseRecipientCsv(csv).recipients).toEqual([
      { name: "Ali N. Khan", phone: "14155552671" },
    ]);
  });

  it("rejects phone numbers truncated into scientific notation by a spreadsheet", () => {
    expect(() => parseRecipientCsv(
      "First Name,Middle Name,Last Name,Phone 1 - Label,Phone 1 - Value\r\n" +
        "Umar,,Bhai,Mobile,9.23313E+11\r\n" +
        "Sara,,,Mobile,9.23019E+12",
    )).toThrow("Scientific notation has truncated phone digits");
  });

  it("requires name and phone columns", () => {
    expect(() => parseRecipientCsv("email,address\na@example.com,Home")).toThrow(
      "CSV must contain a name field and a phone field",
    );
  });
});
