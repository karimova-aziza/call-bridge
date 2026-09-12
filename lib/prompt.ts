import { LANGS, type LangCode } from "./langs";

/*
 * ---------------------------------------------------------------------------
 * THIS FILE IS THE PRODUCT. Everything else is plumbing.
 *
 * The glossary below is what makes this better than Google Translate for these
 * conversations. Add a line every single time someone tells you a translation
 * confused their parent. Over months this becomes the thing nobody else has.
 * ---------------------------------------------------------------------------
 */

export const GLOSSARY = `
Institutional terms that generic translation gets wrong. Render them so a
non-academic parent understands the real-world consequence, not the literal words:

- "academic probation" -> explain as a formal warning that the student's grades
  are below the required level and they may be removed if it does not improve.
- "credit transfer" -> explain as courses already passed being counted toward
  the new degree.
- "deferral" -> explain as officially postponing the start to a later term,
  with the place held.
- "conditional admission" -> explain as accepted, but only if specific
  requirements are met first.
- "office hours" -> explain as the set times a professor is available to meet,
  not a workplace schedule.
- "withdraw" (from a course) -> explain as formally leaving the course before
  it ends, which is different from failing it.
- "financial aid package" -> explain as the combination of grants, loans and
  work offered, making clear which parts must be paid back.
- "GPA" -> keep the abbreviation but add a short plain explanation of the scale.
`.trim();

export function translationPrompt(
  text: string,
  sourceLang: LangCode,
  targets: LangCode[],
) {
  const targetList = targets.map((t) => `"${t}": "${LANGS[t].name}"`).join(", ");

  return `You are interpreting a live conversation between a university student's parent, who does not speak English, and someone from the student's institution such as a professor or an advisor.

The speaker just said the following in ${LANGS[sourceLang].name}:

"""
${text}
"""

Translate it into each of these languages: ${targetList}

Rules:
- Translate meaning, not words. This is speech, so keep it natural and spoken.
- Keep the speaker's register. If they are being warm or worried, keep that.
- Never add information, never answer on the speaker's behalf, never summarise.
- Keep it roughly the same length as the original.
- Numbers, dates and names must carry across exactly.
- If the speech is unclear or cut off, translate what is there rather than guessing.

${GLOSSARY}

Respond with ONLY a JSON object mapping each language code to its translation.
No markdown, no code fences, no commentary. Example shape:
{"en": "...", "ru": "..."}`;
}

export function summaryPrompt(transcript: string, target: LangCode) {
  return `Below is the transcript of a call between a university student's parent and someone from the student's institution.

Write a short written recap for the PARENT to read afterwards, in ${LANGS[target].name}.

The reader is not a native English speaker, is not familiar with how foreign universities work, and was probably nodding along during the call without following everything. Write for them, plainly. No jargon.

Structure it with exactly these three headings, translated into ${LANGS[target].name}:
1. What was discussed
2. What was decided
3. What needs to happen next

Rules:
- Short bullet points, not paragraphs.
- Every deadline or date mentioned must appear on its own line under section 3, with who is responsible.
- If a section had nothing in it, write one line saying nothing was decided. Do NOT invent content.
- If an amount of money was mentioned, state the currency.
- Do not editorialise or reassure. Report what was said.

${GLOSSARY}

Transcript:
"""
${transcript}
"""`;
}
