import { NextResponse } from "next/server";
import { ensureVideoRoom } from "@/lib/daily";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    const url = await ensureVideoRoom(String(code).toUpperCase());
    return NextResponse.json({ url });
  } catch (err) {
    // Video is optional. If it fails, the call still works as audio-only —
    // never let a video problem break the thing people actually came for.
    const message = err instanceof Error ? err.message : "Video unavailable";
    return NextResponse.json({ error: message }, { status: 200 });
  }
}
