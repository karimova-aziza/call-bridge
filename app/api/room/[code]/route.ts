import { NextResponse } from "next/server";
import { getMessages, getParticipants } from "@/lib/store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const since = Number(new URL(req.url).searchParams.get("since") ?? 0);

  const [messages, participants] = await Promise.all([
    getMessages(code.toUpperCase(), since),
    getParticipants(code.toUpperCase()),
  ]);

  return NextResponse.json({ messages, participants, next: since + messages.length });
}
