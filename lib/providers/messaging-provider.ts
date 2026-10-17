import type { ConnectionSnapshot } from "@/lib/types";

export interface MessagingProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getSnapshot(): ConnectionSnapshot;
  getQrDataUrl(): string | null;
  sendMessage(phone: string, message: string): Promise<void>;
}

