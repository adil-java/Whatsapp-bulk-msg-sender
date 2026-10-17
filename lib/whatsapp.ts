import "server-only";

import { WhatsAppWebProvider } from "@/lib/providers/whatsapp-web-provider";

const globalForWhatsApp = globalThis as typeof globalThis & {
  whatsappProvider?: WhatsAppWebProvider;
};

export const whatsapp =
  globalForWhatsApp.whatsappProvider ?? (globalForWhatsApp.whatsappProvider = new WhatsAppWebProvider());

