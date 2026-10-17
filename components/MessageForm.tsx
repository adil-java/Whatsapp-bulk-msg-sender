"use client";

import { useState } from "react";
import { RecipientInput } from "@/components/RecipientInput";
import { normalizePhoneNumber } from "@/lib/phone";
import type { Recipient, SendCampaign, WhatsAppStatus } from "@/lib/types";

type MessageFormProps = {
  connectionStatus: WhatsAppStatus;
  onCampaign: (campaign: SendCampaign) => void;
  onScheduled: () => void;
};

export function MessageForm({ connectionStatus, onCampaign, onScheduled }: MessageFormProps) {
  const [recipients, setRecipients] = useState("");
  const [importedRecipients, setImportedRecipients] = useState<Recipient[]>([]);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const hasInvalidImportedPhone = importedRecipients.some((recipient) => {
    try {
      normalizePhoneNumber(recipient.phone);
      return false;
    } catch {
      return true;
    }
  });

  async function pollCampaign(id: string) {
    const response = await fetch(`/api/send/${id}`, { cache: "no-store" });
    const campaign = (await response.json()) as SendCampaign & { error?: string };
    if (!response.ok) throw new Error(campaign.error ?? "Unable to load campaign status.");
    onCampaign(campaign);
    if (campaign.status === "PROCESSING") {
      window.setTimeout(() => {
        void pollCampaign(id).catch((error: unknown) => {
          setFeedback(error instanceof Error ? error.message : String(error));
        });
      }, 800);
    }
  }

  async function send() {
    setSending(true);
    setFeedback(null);
    try {
      if (mode === "schedule" && (!date || !time)) throw new Error("Choose a future date and time.");
      const endpoint = mode === "now" ? "/api/send" : "/api/schedule";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: importedRecipients.length > 0
            ? importedRecipients
            : recipients.split(/[\n,]+/).map((value) => value.trim()).filter(Boolean),
          message,
          ...(mode === "schedule" ? { scheduledAt: new Date(`${date}T${time}`).toISOString() } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Message failed.");
      if (mode === "now") {
        const campaign = data as SendCampaign;
        onCampaign(campaign);
        setFeedback("Campaign started. Messages are sent one at a time.");
        void pollCampaign(campaign.id).catch((error: unknown) => {
          setFeedback(error instanceof Error ? error.message : String(error));
        });
      } else {
        setFeedback("Message scheduled. Keep this server running until it completes.");
        onScheduled();
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : String(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">New campaign</p>
      <h2 className="mt-2 text-2xl font-semibold">Send reminders</h2>
      <div className="mt-6">
        <RecipientInput
          value={recipients}
          onChange={(value) => {
            setRecipients(value);
            setImportedRecipients([]);
          }}
          importedRecipients={importedRecipients}
          onCsvImport={(nextRecipients) => {
            setImportedRecipients(nextRecipients);
            setRecipients(nextRecipients.map((recipient) => recipient.phone).join("\n"));
          }}
          disabled={sending}
        />
      </div>
      <label className="mt-5 block text-sm font-semibold" htmlFor="message">Message</label>
      <textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} rows={6} placeholder="Your reminder…" className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
      {importedRecipients.some((recipient) => recipient.name) && <p className="mt-2 text-xs text-slate-500">Use <span className="font-mono">{"{{name}}"}</span> to insert each CSV recipient&apos;s name.</p>}
      <fieldset className="mt-5">
        <legend className="text-sm font-semibold">Send option</legend>
        <div className="mt-2 flex gap-5 text-sm">
          <label className="flex items-center gap-2"><input type="radio" name="mode" checked={mode === "now"} onChange={() => setMode("now")} /> Send now</label>
          <label className="flex items-center gap-2"><input type="radio" name="mode" checked={mode === "schedule"} onChange={() => setMode("schedule")} /> Schedule</label>
        </div>
      </fieldset>
      {mode === "schedule" && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" /></label>
          <label className="text-sm font-semibold">Time<input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" /></label>
        </div>
      )}
      {feedback && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{feedback}</p>}
      <button onClick={() => void send()} disabled={sending || connectionStatus !== "CONNECTED" || !recipients.trim() || !message.trim() || hasInvalidImportedPhone} className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">{sending ? "Working…" : mode === "now" ? "Send now" : "Schedule message"}</button>
    </section>
  );
}
