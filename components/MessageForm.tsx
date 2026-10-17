"use client";

import { useState } from "react";
import { RecipientInput } from "@/components/RecipientInput";
import type { SendCampaign, WhatsAppStatus } from "@/lib/types";

type MessageFormProps = {
  connectionStatus: WhatsAppStatus;
  onCampaign: (campaign: SendCampaign) => void;
};

export function MessageForm({ connectionStatus, onCampaign }: MessageFormProps) {
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

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
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: recipients.split(/[\n,]+/).map((value) => value.trim()).filter(Boolean),
          message,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Message failed.");
      const campaign = data as SendCampaign;
      onCampaign(campaign);
      setFeedback("Campaign started. Messages are sent one at a time.");
      void pollCampaign(campaign.id).catch((error: unknown) => {
        setFeedback(error instanceof Error ? error.message : String(error));
      });
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
      <div className="mt-6"><RecipientInput value={recipients} onChange={setRecipients} disabled={sending} /></div>
      <label className="mt-5 block text-sm font-semibold" htmlFor="message">Message</label>
      <textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} rows={6} placeholder="Your reminder…" className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
      {feedback && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{feedback}</p>}
      <button onClick={() => void send()} disabled={sending || connectionStatus !== "CONNECTED" || !recipients.trim() || !message.trim()} className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">{sending ? "Starting…" : "Send now"}</button>
    </section>
  );
}
