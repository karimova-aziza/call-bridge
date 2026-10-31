import { NextResponse } from "next/server";
import { setTopic } from "@/lib/store";

/* The person who starts a call can say what it is about. */
export async function POST(req: Request) {
  try {
    const { code, topic } = await req.json();
    const clean = String(topic ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
    if (!code || !clean) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    await setTopic(String(code).toUpperCase(), clean);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
