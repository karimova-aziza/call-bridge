import { NextResponse } from "next/server";
import { addParticipant } from "@/lib/store";
import { isLang } from "@/lib/langs";

export async function POST(req: Request) {
  const { code, name, lang } = await req.json();
  if (!code || !name || !isLang(lang)) {
    return NextResponse.json({ error: "Missing code, name or language" }, { status: 400 });
  }
  await addParticipant(String(code).toUpperCase(), { name, lang });
  return NextResponse.json({ ok: true });
}
