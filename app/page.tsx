"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LANGS, LANG_CODES, type LangCode } from "@/lib/langs";
import { UI } from "@/lib/ui";

function makeCode() {
  // No vowels, no 0/O/1/I — codes get read aloud over the phone.
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
    <main className="home">
      <div className="home-brand">{t.appName}</div>

      <section className="home-hero">
        <h1 className="home-tagline">{t.tagline}</h1>
        <p className="home-sub">{t.sub}</p>
      </section>

      <div className="card">
        <div className="card-title">{t.newCall}</div>
        <div className="field-group">
          <div className="field-wrap">
            <label className="field-label" htmlFor="lang">
              {t.yourLanguage}
            </label>
            <select
              id="lang"
              className="field-select"
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

          <div className="field-wrap">
            <label className="field-label" htmlFor="name">
              {t.yourName}
            </label>
            <input
              id="name"
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <button
            className="btn-primary"
            disabled={!name.trim()}
            onClick={() => go(makeCode())}
          >
            {t.start}
          </button>
        </div>
      </div>

      <div className="divider-row">{t.haveCode}</div>

      <div className="card">
        <div className="code-row">
          <input
            className="code-input"
            value={code}
            maxLength={4}
            placeholder={t.codePlaceholder}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            aria-label={t.codeLabel}
          />
          <button
            className="btn-join"
            disabled={!name.trim() || code.trim().length < 4}
            onClick={() => go(code.trim())}
          >
            {t.join}
          </button>
        </div>
      </div>
    </main>
  );
}
