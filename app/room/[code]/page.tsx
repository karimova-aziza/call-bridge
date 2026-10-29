"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LANGS, isLang, type LangCode } from "@/lib/langs";
import { UI } from "@/lib/ui";

type Term = { word: string; explanation: string };

type Msg = {
  id: string;
  speaker: string;
  sourceLang: LangCode;
  original: string;
  translations: Partial<Record<LangCode, string>>;
  terms?: Partial<Record<LangCode, Term[]>>;
};

type Person = { name: string; lang: LangCode };

function pickMime() {
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const o of options) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(o))
      return o;
  }
  return "";
}

function speak(text: string, lang: LangCode) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
  if (!match) return;
  const u = new SpeechSynthesisUtterance(text);
  u.voice = match;
  u.lang = match.lang;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

function Room() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const code = (params.code ?? "").toUpperCase();
  const rawLang = search.get("lang") ?? "en";
  const lang: LangCode = isLang(rawLang) ? rawLang : "en";
  const name = search.get("name") || "Guest";
  const t = UI[lang];

  const [messages, setMessages] = useState<Msg[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [whoSpeaking, setWhoSpeaking] = useState<string | null>(null);
  const [callState, setCallState] = useState<"idle" | "live" | "busy">("idle");
  const [error, setError] = useState("");
  const [recap, setRecap] = useState("");
  const [ending, setEnding] = useState(false);
  const [copied, setCopied] = useState(false);

  // Which term chip is currently expanded — tracks by message id + word
  const [expandedTerm, setExpandedTerm] = useState<{
    msgId: string;
    word: string;
    explanation: string;
  } | null>(null);

  const cursor = useRef(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const feedEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name, lang }),
    }).catch(() => {});
  }, [code, name, lang]);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/room/${code}?since=${cursor.current}`);
        if (!res.ok || !alive) return;
        const data = await res.json();
        setPeople(data.participants ?? []);
        setWhoSpeaking(data.speaking ?? null);
        if (data.messages?.length) {
          cursor.current = data.next;
          setMessages((prev) => [...prev, ...data.messages]);
          for (const m of data.messages as Msg[]) {
            if (m.sourceLang === lang) continue;
            speak(m.translations[lang] ?? m.original, lang);
          }
        }
      } catch { /* transient */ }
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => { alive = false; clearInterval(id); };
  }, [code, lang]);

  useEffect(() => {
    feedEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, whoSpeaking]);

  const broadcastSpeaking = useCallback((active: boolean) => {
    fetch("/api/speaking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name: active ? name : null }),
    }).catch(() => {});
  }, [code, name]);

  const send = useCallback(async (blob: Blob) => {
    const form = new FormData();
    form.append("audio", blob, "clip.webm");
    form.append("code", code);
    form.append("name", name);
    form.append("lang", lang);
    try {
      const res = await fetch("/api/speak", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) setError(data.error);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setCallState("idle");
    }
  }, [code, name, lang]);

  const startRecording = useCallback(async () => {
    if (callState !== "idle") return;
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunks.current, { type: mime || "audio/webm" });
        if (blob.size > 2000) send(blob);
        else setCallState("idle");
      };
      rec.start();
      recorder.current = rec;
      setCallState("live");
      broadcastSpeaking(true);
    } catch {
      setError(t.micDenied);
    }
  }, [callState, send, t.micDenied, broadcastSpeaking]);

  const stopRecording = useCallback(() => {
    broadcastSpeaking(false);
    if (recorder.current?.state === "recording") {
      recorder.current.stop();
      setCallState("busy");
    }
  }, [broadcastSpeaking]);

  const finish = async () => {
    setEnding(true);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, lang }),
      });
      const data = await res.json();
      setRecap(data.summary ?? data.error ?? "");
    } finally {
      setEnding(false);
    }
  };

  const btnLabel =
    callState === "live" ? t.speaking :
    callState === "busy" ? t.sending :
    t.hold;

  const otherSpeaking = whoSpeaking && whoSpeaking !== name ? whoSpeaking : null;

  return (
    <div className="room">
      <header className="roombar">
        <div>
          <div className="room-code-label">{t.codeLabel}</div>
          <strong className="room-code">{code}</strong>
        </div>
        <div className="who">
          {people.map((p) => (
            <span key={p.name} className={`tag tag-${p.lang}`}>
              {p.name}
            </span>
          ))}
        </div>
      </header>

      {error && <div className="notice">{error}</div>}

      <div className="feed">
        {!messages.length && (
          <p className="empty">
            {people.length < 2 ? t.waiting : t.nobodyYet}
          </p>
        )}

        {messages.map((m) => {
          const mine = m.speaker === name;
          const shown = mine
            ? m.original
            : (m.translations[lang] ?? m.original);
          const showOriginal = !mine && m.original !== shown;
          const myTerms = m.terms?.[lang] ?? [];

          return (
            <div key={m.id} className="bubble-group">
              {/* Main bubble */}
              <div
                className={`bubble ${
                  mine
                    ? "bubble--mine"
                    : `bubble--theirs bubble--${m.sourceLang}`
                }`}
              >
                {!mine && (
                  <div className="bubble-speaker">
                    {m.speaker} · {LANGS[m.sourceLang].label}
                  </div>
                )}
                <div className="bubble-text">{shown}</div>
                {showOriginal && (
                  <div className="bubble-original">{m.original}</div>
                )}
              </div>

              {/* Vocabulary chips — only shown when there are terms for this user's language */}
              {myTerms.length > 0 && (
                <div className={`terms ${mine ? "terms--mine" : ""}`}>
                  {myTerms.map((term) => {
                    const isOpen =
                      expandedTerm?.msgId === m.id &&
                      expandedTerm?.word === term.word;
                    return (
                      <button
                        key={term.word}
                        className={`term-chip${isOpen ? " term-chip--open" : ""}`}
                        onClick={() =>
                          setExpandedTerm(
                            isOpen
                              ? null
                              : {
                                  msgId: m.id,
                                  word: term.word,
                                  explanation: term.explanation,
                                },
                          )
                        }
                      >
                        {term.word}
                      </button>
                    );
                  })}

                  {/* Expanded explanation card */}
                  {expandedTerm?.msgId === m.id && (
                    <div className="term-card">
                      <strong>{expandedTerm.word}</strong>{" "}
                      — {expandedTerm.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {otherSpeaking && (
          <div className="speaking-pill">
            <span className="speaking-dot" />
            <span>{otherSpeaking} {t.speakingSuffix}</span>
            <span className="speaking-anim">···</span>
          </div>
        )}

        {recap && (
          <section className="letter">
            <div className="letter-head">{t.recapTitle}</div>
            <div className="recap">{recap}</div>
            <div className="letter-foot">
              <span>{t.recapFor}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(recap);
                  setCopied(true);
                }}
              >
                {copied ? t.recapCopied : t.copyRecap}
              </button>
            </div>
          </section>
        )}

        <div ref={feedEnd} />
      </div>

      <div className="talkbar">
        <button
          className="talk"
          data-state={callState}
          disabled={callState === "busy"}
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          onPointerLeave={stopRecording}
          onPointerCancel={stopRecording}
          onContextMenu={(e) => e.preventDefault()}
        >
          {btnLabel}
        </button>
        <div className="endline">
          <button onClick={finish} disabled={ending || !messages.length}>
            {ending ? t.recapWorking : t.endCall}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Room />
    </Suspense>
  );
}
