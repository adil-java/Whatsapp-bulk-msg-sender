"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import type { ScheduledCampaign } from "@/lib/types";

export function ScheduledMessages({ refreshToken }: { refreshToken: number }) {
  const [schedules, setSchedules] = useState<ScheduledCampaign[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/schedule", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load schedules.");
      setSchedules(data as ScheduledCampaign[]);
      setError(null);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : String(refreshError));
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 2000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [refresh, refreshToken]);

  async function cancel(id: string) {
    const response = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Unable to cancel schedule.");
      return;
    }
    await refresh();
  }

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Queue</p>
      <h2 className="mt-2 text-2xl font-semibold">Scheduled messages</h2>
      <p className="mt-2 text-sm text-amber-700">Demo mode: scheduled messages work only while this server remains running.</p>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 grid gap-3">
        {schedules.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No messages scheduled.</p>}
        {schedules.map((entry) => {
          const sent = entry.results?.filter((result) => result.status === "SENT").length ?? 0;
          return (
            <article key={entry.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{entry.message.split("\n")[0]}</p>
                <p className="mt-1 text-sm text-slate-500">{format(new Date(entry.scheduledAt), "dd MMM yyyy — hh:mm a")} · {entry.recipients.length} recipient{entry.recipients.length === 1 ? "" : "s"}</p>
                {entry.status !== "SCHEDULED" && <p className="mt-1 text-xs text-slate-500">{sent}/{entry.recipients.length} sent</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{entry.status}</span>
                {entry.status === "SCHEDULED" && <button onClick={() => void cancel(entry.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Cancel</button>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

