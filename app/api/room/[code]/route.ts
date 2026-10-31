import { NextResponse } from "next/server";
import { getMessages, getParticipants, getSpeaking, getTopic } from "@/lib/store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const room = code.toUpperCase();
  const since = Number(new URL(req.url).searchParams.get("since") ?? 0);

  const [messages, participants, speaking, topic] = await Promise.all([
    getMessages(room, since),
    getParticipants(room),
    getSpeaking(room),
    getTopic(room),
  ]);

  return NextResponse.json({
    messages,
    participants,
    speaking,
    hasTopic: !!topic,
    next: since + messages.length,
  });
}
