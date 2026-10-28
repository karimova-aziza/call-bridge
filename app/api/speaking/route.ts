import { NextResponse } from "next/server";
import { setSpeaking } from "@/lib/store";

/* Called when someone presses (name = their name) or releases (name = null). */
export async function POST(req: Request) {
  try {
    const { code, name } = await req.json();
    if (!code) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    await setSpeaking(String(code).toUpperCase(), name ?? null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
