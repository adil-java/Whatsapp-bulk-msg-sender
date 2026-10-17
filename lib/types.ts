export type WhatsAppStatus =
  | "DISCONNECTED"
  | "STARTING"
  | "QR_REQUIRED"
  | "AUTHENTICATING"
  | "CONNECTED"
  | "ERROR";

export type MessageState = "PENDING" | "SENDING" | "SENT" | "FAILED";

export type Recipient = {
  phone: string;
  name?: string;
};

export type MessageResult = {
  phone: string;
  name?: string;
  status: MessageState;
  error?: string;
};

export type CampaignStatus = "PROCESSING" | "COMPLETED";

export type SendCampaign = {
  id: string;
  message: string;
  delayMs: number;
  createdAt: string;
  completedAt?: string;
  status: CampaignStatus;
  results: MessageResult[];
};

export type ScheduledCampaignStatus = "SCHEDULED" | "PROCESSING" | "COMPLETED";

export type ScheduledCampaign = {
  id: string;
  recipients: Recipient[];
  message: string;
  delayMs: number;
  scheduledAt: string;
  createdAt: string;
  status: ScheduledCampaignStatus;
  campaignId?: string;
  results?: MessageResult[];
};

export type ConnectionSnapshot = {
  status: WhatsAppStatus;
  error?: string;
  hasQr: boolean;
};
