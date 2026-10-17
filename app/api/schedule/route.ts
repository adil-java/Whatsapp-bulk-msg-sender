import { NextResponse } from "next/server";
import { getMaxRecipients, parseMessageDelayMs } from "@/lib/config";
import { normalizeRecipientList } from "@/lib/recipients";
import { parseFutureSchedule } from "@/lib/schedule-time";
import { scheduler } from "@/lib/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(scheduler.list());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      recipients?: unknown;
      message?: unknown;
      scheduledAt?: unknown;
      delaySeconds?: unknown;
    };

    if (typeof body.message !== "string" || !body.message.trim()) {
      throw new Error("Message is required.");
    }

    const recipients = normalizeRecipientList(body.recipients, getMaxRecipients());
    const delayMs = parseMessageDelayMs(body.delaySeconds);
    const scheduledAt = parseFutureSchedule(body.scheduledAt);
    const entry = scheduler.schedule(recipients, body.message.trim(), scheduledAt, delayMs);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to schedule campaign." },
      { status: 400 },
    );
  }
}
