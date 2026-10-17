import { NextResponse } from "next/server";
import { normalizePhoneNumber } from "@/lib/phone";
import { whatsapp } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { recipient?: unknown; message?: unknown };
    if (typeof body.recipient !== "string") throw new Error("A recipient is required.");
    if (typeof body.message !== "string" || !body.message.trim()) throw new Error("Message is required.");

    const phone = normalizePhoneNumber(body.recipient);
    await whatsapp.sendMessage(phone, body.message.trim());
    return NextResponse.json({ phone, status: "SENT" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send message." },
      { status: 400 },
    );
  }
}

