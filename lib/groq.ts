const GROQ = "https://api.groq.com/openai/v1";

function key() {
  const k = process.env.GROQ_API_KEY;
  if (!k) throw new Error("GROQ_API_KEY is missing. Add it to .env.local");
  return k;
}

/** Speech to text. Whisper handles ~50 languages including Russian well. */
export async function transcribe(audio: Blob, language?: string) {
  const form = new FormData();
  form.append("file", audio, "clip.webm");
  form.append("model", "whisper-large-v3");
  form.append("response_format", "json");
  // Telling Whisper the language up front is much more accurate than letting
  // it guess on a short clip.
  if (language) form.append("language", language);

  const res = await fetch(`${GROQ}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Transcription failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}

/** Text generation, used for translation and the end-of-call recap. */
export async function chat(prompt: string, opts?: { json?: boolean }) {
  const res = await fetch(`${GROQ}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq chat failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim();
}
