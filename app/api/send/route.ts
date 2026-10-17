import { NextResponse } from "next/server";
import { campaigns } from "@/lib/campaigns";
import { getMaxRecipients } from "@/lib/config";
import { normalizeRecipientList } from "@/lib/recipients";
import { whatsapp } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { recipients?: unknown; message?: unknown };
    if (typeof body.message !== "string" || !body.message.trim()) throw new Error("Message is required.");
    if (whatsapp.getSnapshot().status !== "CONNECTED") throw new Error("WhatsApp is not connected.");

    const recipients = normalizeRecipientList(body.recipients, getMaxRecipients());
    const campaign = campaigns.start(recipients, body.message.trim());
    return NextResponse.json(campaign, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send message." },
      { status: 400 },
    );
  }
}
