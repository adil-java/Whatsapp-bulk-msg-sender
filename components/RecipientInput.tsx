"use client";

import { useState } from "react";
import { parseRecipientCsv } from "@/lib/csv";
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

  async function importCsv(file: File) {
    try {
      const result = parseRecipientCsv(await file.text());
      onCsvImport(result.recipients);
      setCsvErrors(result.errors);
    } catch (error) {
      setCsvErrors([error instanceof Error ? error.message : String(error)]);
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
              const file = event.target.files?.[0];
              if (file) void importCsv(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      <textarea
        id="recipients"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={5}
        placeholder={"03001234567\n03121234567\n03331234567"}
        className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
      />
      <p className="mt-2 text-xs text-slate-500">Enter numbers manually, or upload a CSV with <span className="font-mono">name,phone</span> columns.</p>

      {csvErrors.length > 0 && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <p className="font-semibold">{csvErrors.length} CSV row{csvErrors.length === 1 ? "" : "s"} skipped</p>
          {csvErrors.slice(0, 3).map((error, index) => <p key={`${index}-${error}`} className="mt-1">{error}</p>)}
          {csvErrors.length > 3 && <p className="mt-1">And {csvErrors.length - 3} more…</p>}
        </div>
      )}

      {importedRecipients.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-xl border border-emerald-100">
          <div className="flex items-center justify-between bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            <span>CSV recipients</span>
            <span>{importedRecipients.length} imported</span>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {importedRecipients.map((recipient) => (
              <div key={recipient.phone} className="grid grid-cols-2 gap-3 border-t border-emerald-50 px-3 py-2 text-xs first:border-t-0">
                <span className="truncate font-medium text-slate-800">{recipient.name || "No name"}</span>
                <span className="text-right font-mono text-slate-600">{recipient.phone}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
