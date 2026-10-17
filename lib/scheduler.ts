import "server-only";

import { campaigns } from "@/lib/campaigns";
import { getMessageDelayMs } from "@/lib/config";
import type { Recipient, ScheduledCampaign } from "@/lib/types";

class Scheduler {
  private static readonly MAX_TIMEOUT_MS = 2_147_483_647;
  private schedules = new Map<string, ScheduledCampaign>();
  private timers = new Map<string, NodeJS.Timeout>();

  schedule(
    recipients: Recipient[],
    message: string,
    scheduledAt: Date,
    delayMs: number,
  ): ScheduledCampaign {
    const entry: ScheduledCampaign = {
      id: crypto.randomUUID(),
      recipients,
      message,
      delayMs,
      scheduledAt: scheduledAt.toISOString(),
      createdAt: new Date().toISOString(),
      status: "SCHEDULED",
    };

    this.schedules.set(entry.id, entry);
    this.arm(entry.id);
    return structuredClone(entry);
  }

  private arm(id: string): void {
    const entry = this.schedules.get(id);
    if (!entry || entry.status !== "SCHEDULED") return;
    const remaining = new Date(entry.scheduledAt).getTime() - Date.now();
    const delay = Math.min(Math.max(remaining, 0), Scheduler.MAX_TIMEOUT_MS);
    const timer = setTimeout(() => {
      if (new Date(entry.scheduledAt).getTime() > Date.now()) this.arm(id);
      else this.execute(id);
    }, delay);
    this.timers.set(id, timer);
  }

  list(): ScheduledCampaign[] {
    for (const entry of this.schedules.values()) this.syncCampaign(entry);
    return [...this.schedules.values()]
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .map((entry) => structuredClone(entry));
  }

  cancel(id: string): boolean {
    const entry = this.schedules.get(id);
    if (!entry || entry.status !== "SCHEDULED") return false;

    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.schedules.delete(id);
    return true;
  }

  private execute(id: string): void {
    const entry = this.schedules.get(id);
    if (!entry || entry.status !== "SCHEDULED") return;

    this.timers.delete(id);
    entry.status = "PROCESSING";
    const campaign = campaigns.start(
      entry.recipients,
      entry.message,
      entry.delayMs || getMessageDelayMs(),
    );
    entry.campaignId = campaign.id;
    entry.results = campaign.results;
  }

  private syncCampaign(entry: ScheduledCampaign): void {
    if (!entry.campaignId) return;
    const campaign = campaigns.get(entry.campaignId);
    if (!campaign) return;
    entry.results = campaign.results;
    if (campaign.status === "COMPLETED") entry.status = "COMPLETED";
  }
}

const globalForScheduler = globalThis as typeof globalThis & { scheduler?: Scheduler };

export const scheduler = globalForScheduler.scheduler ?? (globalForScheduler.scheduler = new Scheduler());
