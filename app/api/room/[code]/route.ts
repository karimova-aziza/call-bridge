import { NextResponse } from "next/server";
import { getMessages, getParticipants, getSpeaking } from "@/lib/store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const since = Number(new URL(req.url).searchParams.get("since") ?? 0);

  const [messages, participants, speaking] = await Promise.all([
    getMessages(code.toUpperCase(), since),
    getParticipants(code.toUpperCase()),
    getSpeaking(code.toUpperCase()),
  ]);

  return NextResponse.json({
    messages,
    participants,
    speaking,
    next: since + messages.length,
  });
}
