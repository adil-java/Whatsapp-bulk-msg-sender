"use client";

import { useState } from "react";
import { parseRecipientCsv } from "@/lib/csv";
import { normalizePhoneNumber } from "@/lib/phone";
import type { Recipient } from "@/lib/types";

type RecipientInputProps = {
  value: string;
  onChange: (value: string) => void;
  importedRecipients: Recipient[];
  onCsvImport: (recipients: Recipient[]) => void;
  disabled?: boolean;
};

export function RecipientInput({ value, onChange, importedRecipients, onCsvImport, disabled }: RecipientInputProps) {
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"manual" | "contacts">("manual");

  async function importCsv(file: File) {
    try {
      const result = parseRecipientCsv(await file.text());
      onCsvImport(result.recipients);
      setCsvErrors(result.errors);
      setActiveTab("contacts");
    } catch (error) {
      setCsvErrors([error instanceof Error ? error.message : String(error)]);
    }
  }

  function updateRecipient(index: number, field: "name" | "phone", value: string) {
    onCsvImport(
      importedRecipients.map((recipient, recipientIndex) =>
        recipientIndex === index ? { ...recipient, [field]: value } : recipient,
      ),
    );
  }

  function normalizeEditedPhone(index: number) {
    try {
      updateRecipient(index, "phone", normalizePhoneNumber(importedRecipients[index].phone));
    } catch {
      // Keep the entered value visible so the user can correct it.
    }
  }

  function phoneError(phone: string): string | null {
    try {
      normalizePhoneNumber(phone);
      return null;
    } catch {
      return "Enter a valid Pakistan mobile number.";
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="block text-sm font-semibold" htmlFor="recipients">Recipients</label>
        <label className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100">
          Upload CSV
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={disabled}
            className="sr-only"
            onChange={(event) => {
              const input = event.currentTarget;
              const file = event.target.files?.[0];
              if (file) {
                void importCsv(file).finally(() => {
                  input.value = "";
                });
              }
            }}
          />
        </label>
      </div>
      <div role="tablist" aria-label="Recipient input method" className="mt-3 flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "manual"}
          onClick={() => setActiveTab("manual")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Manual entry
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "contacts"}
          onClick={() => setActiveTab("contacts")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === "contacts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Imported contacts {importedRecipients.length > 0 ? `(${importedRecipients.length})` : ""}
        </button>
      </div>

      {activeTab === "manual" && (
        <div role="tabpanel">
          <textarea
            id="recipients"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            rows={5}
            placeholder={"03001234567\n03121234567\n03331234567"}
            className="mt-3 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
          />
          <p className="mt-2 text-xs text-slate-500">Enter one number per line or separate numbers with commas.</p>
        </div>
      )}

      {activeTab === "contacts" && (
        <div role="tabpanel" className="mt-3 overflow-hidden rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-slate-800">Contact name and number</p>
              <p className="mt-0.5 text-xs text-slate-500">Click any field to correct it before sending.</p>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onCsvImport([...importedRecipients, { name: "", phone: "" }])}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-100"
            >
              Add contact
            </button>
          </div>

          {importedRecipients.length === 0 ? (
            <p className="p-5 text-center text-sm text-slate-500">Upload a Google Contacts CSV to view and edit contacts here.</p>
          ) : (
            <div className="max-h-72 overflow-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="sticky top-0 bg-white text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Name</th>
                    <th className="px-3 py-2 font-semibold">Phone number</th>
                    <th className="w-20 px-3 py-2 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {importedRecipients.map((recipient, index) => {
                    const error = phoneError(recipient.phone);
                    return (
                      <tr key={index} className="border-t border-slate-100 align-top">
                        <td className="px-3 py-2">
                          <input
                            aria-label={`Name for recipient ${index + 1}`}
                            value={recipient.name ?? ""}
                            disabled={disabled}
                            onChange={(event) => updateRecipient(index, "name", event.target.value)}
                            placeholder="Contact name"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            aria-label={`Phone for recipient ${index + 1}`}
                            type="tel"
                            value={recipient.phone}
                            disabled={disabled}
                            onChange={(event) => updateRecipient(index, "phone", event.target.value)}
                            onBlur={() => normalizeEditedPhone(index)}
                            className={`w-full rounded-lg border px-3 py-2 font-mono outline-none focus:border-emerald-500 ${error ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                          />
                          {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onCsvImport(importedRecipients.filter((_, recipientIndex) => recipientIndex !== index))}
                            className="rounded-lg px-2 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className="mt-2 text-xs text-slate-500">Upload a <span className="font-semibold">Google Contacts CSV</span> or a CSV with <span className="font-mono">name,phone</span> columns.</p>

      {csvErrors.length > 0 && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <p className="font-semibold">{csvErrors.length} CSV row{csvErrors.length === 1 ? "" : "s"} skipped</p>
          {csvErrors.slice(0, 3).map((error, index) => <p key={`${index}-${error}`} className="mt-1">{error}</p>)}
          {csvErrors.length > 3 && <p className="mt-1">And {csvErrors.length - 3} more…</p>}
        </div>
      )}

    </div>
  );
}
