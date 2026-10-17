import "server-only";

import type { Recipient, SendCampaign } from "@/lib/types";
import { getMessageDelayMs } from "@/lib/config";
import { personalizeMessage } from "@/lib/message-template";
import { whatsapp } from "@/lib/whatsapp";

class CampaignService {
  constructor(private readonly campaigns: Map<string, SendCampaign>) {}

  start(recipients: Recipient[], message: string, delayMs: number): SendCampaign {
    const campaign: SendCampaign = {
      id: crypto.randomUUID(),
      message,
      delayMs,
      createdAt: new Date().toISOString(),
      status: "PROCESSING",
      results: recipients.map(({ phone, name }) => ({ phone, ...(name ? { name } : {}), status: "PENDING" })),
    };

    this.campaigns.set(campaign.id, campaign);
    void this.process(campaign);
    return structuredClone(campaign);
  }

  get(id: string): SendCampaign | null {
    const campaign = this.campaigns.get(id);
    return campaign ? structuredClone(campaign) : null;
  }

  private async process(campaign: SendCampaign): Promise<void> {
    for (let index = 0; index < campaign.results.length; index += 1) {
      const result = campaign.results[index];
      result.status = "SENDING";
      delete result.error;

      try {
        const message = personalizeMessage(campaign.message, result.name);
        await whatsapp.sendMessage(result.phone, message);
        result.status = "SENT";
      } catch (error) {
        result.status = "FAILED";
        result.error = error instanceof Error ? error.message : String(error);
      }

      if (index < campaign.results.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, campaign.delayMs || getMessageDelayMs()));
      }
    }

    campaign.status = "COMPLETED";
    campaign.completedAt = new Date().toISOString();
  }
}

const globalForCampaigns = globalThis as typeof globalThis & {
  campaignStore?: Map<string, SendCampaign>;
};

const campaignStore =
  globalForCampaigns.campaignStore ?? (globalForCampaigns.campaignStore = new Map<string, SendCampaign>());

// Recreate the service wrapper after a dev hot reload so it always references
// the current WhatsApp module, while keeping campaign results in shared state.
export const campaigns = new CampaignService(campaignStore);
