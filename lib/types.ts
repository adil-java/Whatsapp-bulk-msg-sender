export type WhatsAppStatus =
  | "DISCONNECTED"
  | "STARTING"
  | "QR_REQUIRED"
  | "AUTHENTICATING"
  | "CONNECTED"
  | "ERROR";

export type MessageState = "PENDING" | "SENDING" | "SENT" | "FAILED";

export type MessageResult = {
  phone: string;
  status: MessageState;
  error?: string;
};

export type CampaignStatus = "PROCESSING" | "COMPLETED";

export type SendCampaign = {
  id: string;
  message: string;
  createdAt: string;
  completedAt?: string;
  status: CampaignStatus;
  results: MessageResult[];
};

export type ConnectionSnapshot = {
  status: WhatsAppStatus;
  error?: string;
  hasQr: boolean;
};
