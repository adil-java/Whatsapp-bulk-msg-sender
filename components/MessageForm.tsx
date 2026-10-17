"use client";

import { useState } from "react";
import type { WhatsAppStatus } from "@/lib/types";

export function MessageForm({ connectionStatus }: { connectionStatus: WhatsAppStatus }) {
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function send() {
    setSending(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Message failed.");
      setFeedback(`Message sent to ${data.phone}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : String(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Test message</p>
      <h2 className="mt-2 text-2xl font-semibold">Send to one recipient</h2>
      <label className="mt-6 block text-sm font-semibold" htmlFor="recipient">Recipient</label>
      <input id="recipient" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="03001234567" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
      <label className="mt-5 block text-sm font-semibold" htmlFor="message">Message</label>
      <textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} rows={6} placeholder="Your reminder…" className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
      {feedback && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{feedback}</p>}
      <button onClick={() => void send()} disabled={sending || connectionStatus !== "CONNECTED" || !recipient.trim() || !message.trim()} className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">{sending ? "Sending…" : "Send test message"}</button>
    </section>
  );
}

