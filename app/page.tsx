"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LANGS, LANG_CODES, type LangCode } from "@/lib/langs";
import { UI } from "@/lib/ui";

function makeCode() {
  // No vowels, no 0/O/1/I — this gets read aloud over the phone.
  const alphabet = "BCDFGHJKLMNPQRSTVWXYZ23456789";
  return Array.from(
    { length: 4 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
}

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<LangCode>("en");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const t = UI[lang];
  const go = (roomCode: string) =>
    router.push(
      `/room/${roomCode}?name=${encodeURIComponent(name.trim())}&lang=${lang}`,
    );

  return (
    <main className="shell">
      <p style={{ color: "var(--ink-soft)", margin: 0 }}>{t.appName}</p>
      <h1 className="lede">{t.tagline}</h1>

      <div className="panel stack">
        <div>
          <label htmlFor="lang">{t.yourLanguage}</label>
          <select
            id="lang"
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
          >
            {LANG_CODES.map((c) => (
              <option key={c} value={c}>
                {LANGS[c].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="name">{t.yourName}</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <button
          className="primary"
          disabled={!name.trim()}
          onClick={() => go(makeCode())}
        >
          {t.start}
        </button>
      </div>

      <div className="divider">{t.codeLabel}</div>

      <div className="panel stack">
        <input
          value={code}
          placeholder={t.codePlaceholder}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          style={{ letterSpacing: "0.2em", fontSize: 22 }}
        />
        <button
          className="quiet"
          disabled={!name.trim() || code.trim().length < 4}
          onClick={() => go(code.trim())}
        >
          {t.join}
        </button>
      </div>
    </main>
  );
}
