import { NextResponse } from "next/server";
import { whatsapp } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST() {
  try {
    await whatsapp.connect();
    return NextResponse.json(whatsapp.getSnapshot(), { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start WhatsApp." },
      { status: 500 },
    );
  }
}

