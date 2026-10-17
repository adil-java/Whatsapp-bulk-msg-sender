import { NextResponse } from "next/server";
import { whatsapp } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST() {
  try {
    await whatsapp.disconnect();
    return NextResponse.json(whatsapp.getSnapshot());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to disconnect WhatsApp." },
      { status: 500 },
    );
  }
}

