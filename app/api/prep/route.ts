import { NextResponse } from "next/server";
import { chat } from "@/lib/groq";
import { prepPrompt } from "@/lib/prompt";
import { getPrep, getTopic, setPrep, type Prep, type Term } from "@/lib/store";
import { isLang } from "@/lib/langs";

export const maxDuration = 60;

/* The language the institution speaks. Prep is for people who do not. */
const CALL_LANG = "en";

function parsePrep(raw: string): Prep | null {
  try {
    const p = JSON.parse(raw);
    if (!p || typeof p.title !== "string" || !Array.isArray(p.terms)) return null;
    const ok = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
    const terms: Term[] = p.terms
      .filter((t: Record<string, unknown>) => t && ok(t.original) && ok(t.word) && ok(t.explanation))
      .slice(0, 7)
      .map((t: Record<string, string>) => ({
        original: t.original.trim(),
        word: t.word.trim(),
        explanation: t.explanation.trim(),
      }));
    if (!terms.length) return null;
    return { title: p.title.trim().slice(0, 60), terms };
  } catch {
    return null;
  }
}

/*
 * Returns { prep } or { prep: null }. Prep is an extra: any failure here means
 * the call simply goes ahead without the card, never an error screen.
 */
export async function POST(req: Request) {
  try {
    const { code, lang } = await req.json();
    if (!code || !isLang(lang)) return NextResponse.json({ prep: null });
    if (lang === CALL_LANG) return NextResponse.json({ prep: null });

    const room = String(code).toUpperCase();
    const topic = await getTopic(room);
    if (!topic) return NextResponse.json({ prep: null });

    const cached = await getPrep(room, lang);
    if (cached) return NextResponse.json({ prep: cached });

    const prep = parsePrep(await chat(prepPrompt(topic, lang), { json: true }));
    if (!prep) return NextResponse.json({ prep: null });

    await setPrep(room, lang, prep);
    return NextResponse.json({ prep });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ prep: null });
  }
}
