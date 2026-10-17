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

const dotColor: Record<WhatsAppStatus, string> = {
  DISCONNECTED: "bg-slate-300",
  STARTING: "bg-amber-400 animate-pulse",
  QR_REQUIRED: "bg-amber-400 animate-pulse",
  AUTHENTICATING: "bg-amber-400 animate-pulse",
  CONNECTED: "bg-emerald-500",
  ERROR: "bg-red-400",
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-emerald-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function WhatsAppConnection({ onStatus }: { onStatus: (status: WhatsAppStatus) => void }) {
  const [snapshot, setSnapshot] = useState<ConnectionSnapshot>({ status: "DISCONNECTED", hasQr: false });
  const [qr, setQr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canConnect = snapshot.status === "DISCONNECTED" || snapshot.status === "ERROR";
  const isLoading =
    snapshot.status === "STARTING" ||
    snapshot.status === "AUTHENTICATING" ||
    busy;

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
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            {isLoading && <Spinner />}
            <span>
              Status:{" "}
              <span className="font-semibold text-slate-900">{labels[snapshot.status]}</span>
            </span>
          </div>
        </div>
        <span className={`mt-1 h-3 w-3 rounded-full ${dotColor[snapshot.status]}`} />
      </div>

      {snapshot.status === "STARTING" && (
        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <Spinner />
            Launching browser — this may take 10–20 seconds…
          </p>
          <p className="mt-1 text-xs text-amber-700">
            WhatsApp Web is being opened in a headless browser. Please wait.
          </p>
        </div>
      )}

      {snapshot.status === "AUTHENTICATING" && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-blue-800">
            <Spinner />
            Authenticating with WhatsApp…
          </p>
          <p className="mt-1 text-xs text-blue-700">
            QR scanned successfully. Waiting for WhatsApp to confirm the login.
          </p>
        </div>
      )}

      {snapshot.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{snapshot.error}</p>}

      {qr && (
        <div className="mt-6 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          {/* QR data comes from the local server and changes during login. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="WhatsApp login QR code" className="h-52 w-52 rounded-2xl border bg-white p-2" />
          <div className="text-sm leading-7 text-slate-600">
            <p className="font-semibold text-slate-900">Link this device</p>
            <ol className="list-inside list-decimal">
              <li>Scan this QR with your phone camera.</li>
              <li>Tap the link to open WhatsApp.</li>
              <li>Follow WhatsApp&apos;s prompt and scan the refreshed QR again.</li>
            </ol>
            <p className="mt-2 text-xs leading-5">If WhatsApp opens Linked Devices instead, select <span className="font-semibold">Link a Device</span> and scan the current code.</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => void perform("connect")}
          disabled={busy || !canConnect}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy && snapshot.status !== "CONNECTED" && <Spinner />}
          {snapshot.status === "ERROR" ? "Retry connection" : "Connect WhatsApp"}
        </button>
        <button
          onClick={() => void perform("disconnect")}
          disabled={busy || snapshot.status === "DISCONNECTED"}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
        >
          {busy && snapshot.status === "CONNECTED" && <Spinner />}
          Disconnect &amp; Log out
        </button>
      </div>
    </section>
  );
}
