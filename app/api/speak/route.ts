import { NextResponse } from "next/server";
import { transcribe, chat } from "@/lib/groq";
import { translationPrompt } from "@/lib/prompt";
import { addMessage, getParticipants, type Message, type Term } from "@/lib/store";
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

    const original = await transcribe(audio, sourceLang);
    if (!original) return NextResponse.json({ skipped: "No speech detected" });

    const people = await getParticipants(code);
    const targets = [...new Set(people.map((p) => p.lang))].filter(
      (l) => l !== sourceLang,
    ) as LangCode[];

    let translations: Partial<Record<LangCode, string>> = {};
    let terms: Partial<Record<LangCode, Term[]>> = {};

    if (targets.length) {
      const raw = await chat(
        translationPrompt(original, sourceLang, targets),
        { json: true },
      );
      try {
        const parsed = JSON.parse(raw);

        // Pull out translations (any key that is a valid lang code with a string value)
        for (const [k, v] of Object.entries(parsed)) {
          if (k === "terms") continue;
          if (isLang(k) && typeof v === "string") {
            translations[k as LangCode] = v;
          }
        }

        // Pull out terms (key "terms" → object mapping lang code → array of {word, explanation})
        if (parsed.terms && typeof parsed.terms === "object") {
          for (const [k, v] of Object.entries(parsed.terms)) {
            if (isLang(k) && Array.isArray(v) && v.length > 0) {
              // Validate shape before storing
              const valid = (v as unknown[]).filter(
                (t): t is Term =>
                  typeof t === "object" &&
                  t !== null &&
                  typeof (t as Term).word === "string" &&
                  typeof (t as Term).explanation === "string",
              );
              if (valid.length) terms[k as LangCode] = valid;
            }
          }
        }
      } catch {
        // Malformed JSON — fall back to showing the original text untranslated
        // rather than silently dropping the turn.
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
      terms,
    };

    await addMessage(code, msg);
    return NextResponse.json({ message: msg });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
