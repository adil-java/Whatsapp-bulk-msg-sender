import "server-only";

import type { MessagingProvider } from "@/lib/providers/messaging-provider";
import type { Recipient, SendCampaign } from "@/lib/types";
import { getMessageDelayMs } from "@/lib/config";
import { whatsapp } from "@/lib/whatsapp";

class CampaignService {
  private campaigns = new Map<string, SendCampaign>();

  constructor(private readonly provider: MessagingProvider) {}

  start(recipients: Recipient[], message: string): SendCampaign {
    const campaign: SendCampaign = {
      id: crypto.randomUUID(),
      message,
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
        const message = result.name
          ? campaign.message.replaceAll("{{name}}", result.name)
          : campaign.message;
        await this.provider.sendMessage(result.phone, message);
        result.status = "SENT";
      } catch (error) {
        result.status = "FAILED";
        result.error = error instanceof Error ? error.message : String(error);
      }

      if (index < campaign.results.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, getMessageDelayMs()));
      }
    }

    campaign.status = "COMPLETED";
    campaign.completedAt = new Date().toISOString();
  }
}

const globalForCampaigns = globalThis as typeof globalThis & {
  campaignService?: CampaignService;
};

export const campaigns =
  globalForCampaigns.campaignService ?? (globalForCampaigns.campaignService = new CampaignService(whatsapp));
