"use client";

import { useCallback, useState } from "react";
import { MessageForm } from "@/components/MessageForm";
import { WhatsAppConnection } from "@/components/WhatsAppConnection";
import type { WhatsAppStatus } from "@/lib/types";

export default function Home() {
  const [status, setStatus] = useState<WhatsAppStatus>("DISCONNECTED");
  const handleStatus = useCallback((next: WhatsAppStatus) => setStatus(next), []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-8">
      <header className="mb-9">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Local demo</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">WhatsApp Reminder</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Connect your WhatsApp account and send a reminder to an expected, consenting recipient.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <WhatsAppConnection onStatus={handleStatus} />
        <MessageForm connectionStatus={status} />
      </div>
    </main>
  );
}

