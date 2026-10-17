import { NextResponse } from "next/server";
import { getMaxRecipients } from "@/lib/config";
import { normalizePhoneNumber } from "@/lib/phone";
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
    };

    if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
      throw new Error("At least one recipient is required.");
    }
    if (body.recipients.length > getMaxRecipients()) {
      throw new Error(`Demo supports a maximum of ${getMaxRecipients()} recipients per schedule.`);
    }
    if (!body.recipients.every((recipient) => typeof recipient === "string")) {
      throw new Error("Every recipient must be a phone number.");
    }
    if (typeof body.message !== "string" || !body.message.trim()) {
      throw new Error("Message is required.");
    }

    const recipients = [...new Set(body.recipients.map((recipient) => normalizePhoneNumber(recipient as string)))];
    const scheduledAt = parseFutureSchedule(body.scheduledAt);
    const entry = scheduler.schedule(recipients, body.message.trim(), scheduledAt);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to schedule campaign." },
      { status: 400 },
    );
  }
}

