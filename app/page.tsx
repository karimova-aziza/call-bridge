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
  const [topic, setTopic] = useState("");

  const t = UI[lang];
  const picks = [t.topic1, t.topic2, t.topic3, t.topic4];

  // Only the person who STARTS a call sets its topic. Joiners just enter a code.
  const go = (roomCode: string, withTopic = false) => {
    const topicPart =
      withTopic && topic.trim() ? `&topic=${encodeURIComponent(topic.trim())}` : "";
    router.push(
      `/room/${roomCode}?name=${encodeURIComponent(name.trim())}&lang=${lang}${topicPart}`,
    );
  };

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

          <div className="field-wrap">
            <label className="field-label" htmlFor="topic">
              {t.topicLabel}
            </label>
            <input
              id="topic"
              className="field-input"
              value={topic}
              maxLength={80}
              placeholder={t.topicPlaceholder}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="topic-chips">
              {picks.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`topic-chip${topic === p ? " topic-chip--on" : ""}`}
                  onClick={() => setTopic(topic === p ? "" : p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            disabled={!name.trim()}
            onClick={() => go(makeCode(), true)}
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
