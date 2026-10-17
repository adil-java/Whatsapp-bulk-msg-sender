import { NextResponse } from "next/server";
import { scheduler } from "@/lib/scheduler";

export const runtime = "nodejs";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!scheduler.cancel(id)) {
    return NextResponse.json(
      { error: "Schedule was not found or has already started." },
      { status: 409 },
    );
  }
  return new NextResponse(null, { status: 204 });
}

