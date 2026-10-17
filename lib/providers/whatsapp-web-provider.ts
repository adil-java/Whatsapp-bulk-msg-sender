import "server-only";

import QRCode from "qrcode";
import { Client, LocalAuth } from "whatsapp-web.js";
import type { MessagingProvider } from "@/lib/providers/messaging-provider";
import { recipientNumberCandidates } from "@/lib/recipient-candidates";
import type { ConnectionSnapshot, WhatsAppStatus } from "@/lib/types";

export class WhatsAppWebProvider implements MessagingProvider {
  private client: Client | null = null;
  private status: WhatsAppStatus = "DISCONNECTED";
  private error?: string;
  private qrDataUrl: string | null = null;
  private initialization: Promise<void> | null = null;
  private accountCountryCode = "";

  async connect(): Promise<void> {
    if (this.status === "CONNECTED" || this.initialization) return;

    this.status = "STARTING";
    this.error = undefined;
    this.qrDataUrl = null;
    this.client = this.createClient();

    this.initialization = this.client.initialize().catch((error: unknown) => {
      this.status = "ERROR";
      this.error = this.errorMessage(error);
      this.initialization = null;
      this.client = null;
    });

    // Initialization remains pending until WhatsApp authentication completes.
    // Do not await it here or the connect API would block before the QR is scanned.
  }

  async disconnect(): Promise<void> {
    const client = this.client;
    this.client = null;
    this.initialization = null;
    this.qrDataUrl = null;
    this.accountCountryCode = "";
    this.error = undefined;
    this.status = "DISCONNECTED";

    if (client) {
      try {
        // logout() removes the saved session so the next connect requires a fresh QR scan.
        await client.logout();
      } catch {
        // logout may fail if the connection was already lost; proceed to destroy anyway.
      }
      await client.destroy();
    }
  }

  getSnapshot(): ConnectionSnapshot {
    return { status: this.status, error: this.error, hasQr: Boolean(this.qrDataUrl) };
  }

  getQrDataUrl(): string | null {
    return this.qrDataUrl;
  }

  async sendMessage(phone: string, message: string): Promise<void> {
    if (this.status !== "CONNECTED" || !this.client) {
      throw new Error("WhatsApp is not connected.");
    }

    const client = this.client;
    const recipientId = await this.resolveRecipientId(client, phone);
    if (!recipientId) {
      throw new Error(
        `The number ${phone} is not registered on WhatsApp. Check the number in Imported contacts.`,
      );
    }

    try {
      await client.sendMessage(recipientId, message);
    } catch (error) {
      if (this.isTransientFrameError(error)) {
        throw new Error(
          "WhatsApp Web reloaded while sending. Wait a moment and retry this recipient; the app will not auto-retry to avoid a duplicate message.",
        );
      }
      throw error;
    }
  }

  private createClient(): Client {
    const client = new Client({
      authStrategy: new LocalAuth({ clientId: "demo", dataPath: "sessions" }),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    client.on("qr", async (qr) => {
      this.status = "QR_REQUIRED";
      this.error = undefined;
      try {
        this.qrDataUrl = await QRCode.toDataURL(qr, { margin: 1, width: 320 });
      } catch (error) {
        this.status = "ERROR";
        this.error = `Unable to render QR code: ${this.errorMessage(error)}`;
      }
    });

    client.on("authenticated", () => {
      this.status = "AUTHENTICATING";
      this.qrDataUrl = null;
    });

    client.on("ready", () => {
      this.status = "CONNECTED";
      this.error = undefined;
      this.qrDataUrl = null;
      this.initialization = null;
      void client
        .getCountryCode(client.info.wid.user)
        .then((countryCode) => {
          this.accountCountryCode = countryCode;
        })
        .catch(() => {
          // The value is fetched again during recipient lookup if needed.
        });
    });

    client.on("auth_failure", (message) => {
      this.status = "ERROR";
      this.error = `Authentication failed: ${message}`;
      this.qrDataUrl = null;
      this.initialization = null;
    });

    client.on("disconnected", (reason) => {
      this.status = "DISCONNECTED";
      this.error = `WhatsApp disconnected: ${String(reason)}`;
      this.qrDataUrl = null;
      this.accountCountryCode = "";
      this.client = null;
      this.initialization = null;
    });

    return client;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private async resolveRecipientId(client: Client, phone: string): Promise<string | null> {
    const maximumAttempts = 3;

    for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
      try {
        if (!this.accountCountryCode) {
          this.accountCountryCode = await client.getCountryCode(client.info.wid.user);
        }

        for (const candidate of recipientNumberCandidates(phone, this.accountCountryCode)) {
          const numberId = await client.getNumberId(candidate);
          if (numberId) return numberId._serialized;
        }
        return null;
      } catch (error) {
        if (!this.isTransientFrameError(error)) throw error;
        if (attempt === maximumAttempts) {
          throw new Error("WhatsApp Web is still reloading. Wait a moment and try sending again.");
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }

    return null;
  }

  private isTransientFrameError(error: unknown): boolean {
    return /detached frame|execution context was destroyed|target closed|session closed/i.test(
      this.errorMessage(error),
    );
  }
}
