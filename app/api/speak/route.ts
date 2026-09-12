import { NextResponse } from "next/server";
import { transcribe, chat } from "@/lib/groq";
import { translationPrompt } from "@/lib/prompt";
import { addMessage, getParticipants, type Message } from "@/lib/store";
import { isLang, type LangCode } from "@/lib/langs";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio") as Blob | null;
    const code = String(form.get("code") ?? "").toUpperCase();
    const speaker = String(form.get("name") ?? "Someone");
    const sourceLang = String(form.get("lang") ?? "");

    if (!audio || !code || !isLang(sourceLang)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // 1. Speech to text, in the speaker's own language.
    const original = await transcribe(audio, sourceLang);
    if (!original) {
      return NextResponse.json({ skipped: "No speech detected" });
    }

    // 2. Work out which languages actually need a translation.
    const people = await getParticipants(code);
    const targets = [...new Set(people.map((p) => p.lang))].filter(
      (l) => l !== sourceLang,
    ) as LangCode[];

    let translations: Partial<Record<LangCode, string>> = {};
    if (targets.length) {
      const raw = await chat(translationPrompt(original, sourceLang, targets), {
        json: true,
      });
      try {
        translations = JSON.parse(raw);
      } catch {
        // If the model returns something malformed, show the original rather
        // than dropping the turn entirely. A garbled turn is better than silence.
        translations = Object.fromEntries(targets.map((t) => [t, original]));
      }
    }

    const msg: Message = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      speaker,
      sourceLang,
      original,
      translations,
    };

    await addMessage(code, msg);
    return NextResponse.json({ message: msg });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
