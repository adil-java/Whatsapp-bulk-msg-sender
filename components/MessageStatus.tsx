import type { SendCampaign } from "@/lib/types";

const statusStyles = {
  PENDING: "bg-slate-100 text-slate-700",
  SENDING: "bg-amber-100 text-amber-800",
  SENT: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

export function MessageStatus({ campaign }: { campaign: SendCampaign }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Results</p>
          <h2 className="mt-2 text-2xl font-semibold">Message delivery</h2>
        </div>
        <span className="text-sm text-slate-500">{campaign.status === "PROCESSING" ? "Sending sequentially…" : "Complete"}</span>
      </div>
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
        {campaign.results.map((result) => (
          <div key={result.phone} className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-100 p-4 last:border-b-0">
            <div>
              {result.name && <p className="text-sm font-semibold text-slate-800">{result.name}</p>}
              <p className="font-mono text-sm">{result.phone}</p>
              {result.error && <p className="mt-1 text-xs text-red-700">{result.error}</p>}
            </div>
            <span className={`self-start rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[result.status]}`}>{result.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
