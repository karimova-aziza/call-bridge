import { NextResponse } from "next/server";
import { chat } from "@/lib/groq";
import { summaryPrompt } from "@/lib/prompt";
import { getMessages } from "@/lib/store";
import { isLang } from "@/lib/langs";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { code, lang } = await req.json();
    if (!code || !isLang(lang)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const messages = await getMessages(String(code).toUpperCase());
    if (!messages.length) {
      return NextResponse.json({ error: "Nothing was said in this call" }, { status: 400 });
    }

    // Build the transcript from what each person actually said, in their own
    // language, labelled by speaker.
    const transcript = messages
      .map((m) => `${m.speaker} (${m.sourceLang}): ${m.original}`)
      .join("\n");

    const summary = await chat(summaryPrompt(transcript, lang));
    return NextResponse.json({ summary, turns: messages.length });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
