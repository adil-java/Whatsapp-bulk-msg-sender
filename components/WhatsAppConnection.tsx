"use client";

import { useCallback, useEffect, useState } from "react";
import type { ConnectionSnapshot, WhatsAppStatus } from "@/lib/types";

const labels: Record<WhatsAppStatus, string> = {
  DISCONNECTED: "Disconnected",
  STARTING: "Starting WhatsApp…",
  QR_REQUIRED: "Waiting for QR scan",
  AUTHENTICATING: "Authenticating…",
  CONNECTED: "Connected",
  ERROR: "Connection error",
};

export function WhatsAppConnection({ onStatus }: { onStatus: (status: WhatsAppStatus) => void }) {
  const [snapshot, setSnapshot] = useState<ConnectionSnapshot>({ status: "DISCONNECTED", hasQr: false });
  const [qr, setQr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canConnect = snapshot.status === "DISCONNECTED" || snapshot.status === "ERROR";

  const refresh = useCallback(async () => {
    const response = await fetch("/api/whatsapp/status", { cache: "no-store" });
    const next = (await response.json()) as ConnectionSnapshot;
    setSnapshot(next);
    onStatus(next.status);

    if (next.hasQr) {
      const qrResponse = await fetch("/api/whatsapp/qr", { cache: "no-store" });
      const data = (await qrResponse.json()) as { qr: string | null };
      setQr(data.qr);
    } else {
      setQr(null);
    }
  }, [onStatus]);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 2000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [refresh]);

  async function perform(action: "connect" | "disconnect") {
    setBusy(true);
    try {
      const response = await fetch(`/api/whatsapp/${action}`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `Unable to ${action}.`);
      await refresh();
    } catch (error) {
      setSnapshot({ status: "ERROR", hasQr: false, error: error instanceof Error ? error.message : String(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">WhatsApp</p>
          <h2 className="mt-2 text-2xl font-semibold">Connect your account</h2>
          <p className="mt-2 text-sm text-slate-600">Status: <span className="font-semibold text-slate-900">{labels[snapshot.status]}</span></p>
        </div>
        <span className={`mt-1 h-3 w-3 rounded-full ${snapshot.status === "CONNECTED" ? "bg-emerald-500" : "bg-amber-400"}`} />
      </div>

      {snapshot.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{snapshot.error}</p>}

      {qr && (
        <div className="mt-6 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          {/* QR data comes from the local server and changes during login. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="WhatsApp login QR code" className="h-52 w-52 rounded-2xl border bg-white p-2" />
          <div className="text-sm leading-7 text-slate-600">
            <p className="font-semibold text-slate-900">Open WhatsApp</p>
            <p>Linked Devices → Link a Device → Scan this QR code</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button onClick={() => void perform("connect")} disabled={busy || !canConnect} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">{snapshot.status === "ERROR" ? "Retry connection" : "Connect WhatsApp"}</button>
        <button onClick={() => void perform("disconnect")} disabled={busy || snapshot.status === "DISCONNECTED"} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">Disconnect</button>
      </div>
    </section>
  );
}
