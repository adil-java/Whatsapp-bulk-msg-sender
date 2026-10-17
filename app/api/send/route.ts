import { NextResponse } from "next/server";
import { campaigns } from "@/lib/campaigns";
import { getMaxRecipients } from "@/lib/config";
import { normalizePhoneNumber } from "@/lib/phone";
import { whatsapp } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { recipients?: unknown; message?: unknown };
    if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
      throw new Error("At least one recipient is required.");
    }
    if (typeof body.message !== "string" || !body.message.trim()) throw new Error("Message is required.");
    if (whatsapp.getSnapshot().status !== "CONNECTED") throw new Error("WhatsApp is not connected.");
    if (body.recipients.length > getMaxRecipients()) {
      throw new Error(`Demo supports a maximum of ${getMaxRecipients()} recipients per send.`);
    }
    if (!body.recipients.every((recipient) => typeof recipient === "string")) {
      throw new Error("Every recipient must be a phone number.");
    }

    const recipients = [...new Set(body.recipients.map((recipient) => normalizePhoneNumber(recipient as string)))];
    const campaign = campaigns.start(recipients, body.message.trim());
    return NextResponse.json(campaign, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send message." },
      { status: 400 },
    );
  }
}
