import { NextResponse } from "next/server";
import { whatsapp } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ qr: whatsapp.getQrDataUrl() });
}

