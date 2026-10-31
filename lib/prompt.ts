import { LANGS, type LangCode } from "./langs";

export const GLOSSARY = `
Institutional terms that generic translation gets wrong. Render them so a
non-academic parent understands the real-world consequence:

- "academic probation" → explain as a formal warning that grades are below
  the required level and removal may follow if it does not improve.
- "credit transfer" → explain as courses already passed being counted toward
  the new degree.
- "deferral" → explain as officially postponing the start to a later term,
  with the place held.
- "conditional admission" → explain as accepted, but only if specific
  requirements are met first.
- "office hours" → explain as the set times a professor is available to meet.
- "withdraw" (from a course) → explain as formally leaving the course before
  it ends, which is different from failing it.
- "financial aid package" → explain as the combination of grants, loans and
  work offered, making clear which parts must be paid back.
- "GPA" → keep the abbreviation but add a short plain explanation.
`.trim();

/*
 * This is the core of the product.
 *
 * One LLM call does TWO things at once — no extra latency:
 *   1. Translates the spoken text into every other language in the room.
 *   2. Identifies 0–3 key terms a non-native speaker might not know, and
 *      explains each one plainly in every target language.
 *
 * Terms to flag: institutional vocabulary, acronyms, culturally specific
 * phrases. Skip common words and anything already in the glossary.
 * When in doubt, return fewer terms rather than more — a chip that teaches
 * something is good; a chip for an obvious word is noise.
 */
export function translationPrompt(
  text: string,
  sourceLang: LangCode,
  targets: LangCode[],
) {
  const targetList = targets.map((t) => `"${t}": "${LANGS[t].name}"`).join(", ");
  const targetKeys = targets.map((t) => `"${t}"`).join(", ");

  return `You are interpreting a live conversation between a university student's parent and someone from the student's institution.

The speaker just said the following in ${LANGS[sourceLang].name}:

"""
${text}
"""

Do two things:

TASK 1 — TRANSLATE
Translate the text into each of these languages: ${targetList}

Rules:
- Translate meaning, not words. This is live speech — keep it natural.
- Keep the speaker's emotional register. Warmth or worry should carry across.
- Never add information or answer on the speaker's behalf.
- Keep it roughly the same length as the original.
- Numbers, dates and names must carry across exactly.

${GLOSSARY}

TASK 2 — EXTRACT KEY TERMS
Identify 0 to 3 terms from this turn that a non-native speaker or parent might not understand. Only flag: institutional vocabulary, acronyms, degree/credit terminology, financial terms, or culturally specific phrases. Do NOT flag common conversational words.

For each term, provide:
- "original": the term exactly as the speaker said it, in ${LANGS[sourceLang].name}
- "word": the same term as it appears in your translation, in each target language
- "explanation": a plain 1–2 sentence explanation in each target language, written for a parent with no university background

If no important terms exist in this turn, omit "terms" from your response entirely.

Respond with ONLY a valid JSON object. No markdown, no code fences, no commentary.

Required shape (fill in all ${targetKeys} keys):
{
  "en": "<translation in English if English is a target>",
  "ru": "<translation in Russian if Russian is a target>",
  "uz": "<translation in Uzbek if Uzbek is a target>",
  "terms": {
    "en": [{"original": "<term as spoken>", "word": "<term>", "explanation": "<plain explanation in English>"}],
    "ru": [{"original": "<term as spoken>", "word": "<term>", "explanation": "<plain explanation in Russian>"}],
    "uz": [{"original": "<term as spoken>", "word": "<term>", "explanation": "<plain explanation in Uzbek>"}]
  }
}

Only include keys for the target languages listed above. Omit "terms" entirely when there are no important terms.`;
}

export function summaryPrompt(transcript: string, target: LangCode) {
  return `Below is the transcript of a call between a university student's parent and someone from the student's institution.

Write a short recap for the PARENT to read afterwards, in ${LANGS[target].name}.

The reader is not a native English speaker, is not familiar with how foreign universities work, and was probably nodding along without following everything. Write for them, plainly.

IMPORTANT: Do NOT use markdown formatting. No asterisks, no bold text, no ## headings, no bullet dashes. Write in plain text only. Use clear section titles as plain words on their own line, followed by short plain sentences.

Structure it with exactly these three sections, with the heading translated into ${LANGS[target].name}:

What was discussed
[2-3 plain sentences]

What was decided
[2-3 plain sentences, or "Nothing was decided" if true]

What needs to happen next
[plain sentences, one action per line, with any deadline and who is responsible — no invented content]

Rules:
- No markdown. No asterisks. No dashes used as bullets.
- Every deadline or date mentioned must appear under the third section.
- If a section had nothing in it, write one plain sentence saying so.
- Do not invent or assume anything not said in the transcript.
- If an amount of money was mentioned, include the currency.

${GLOSSARY}

Transcript:
"""
${transcript}
"""`;
}
