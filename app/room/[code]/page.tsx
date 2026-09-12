"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LANGS, isLang, type LangCode } from "@/lib/langs";
import { UI } from "@/lib/ui";

type Msg = {
  id: string;
  speaker: string;
  sourceLang: LangCode;
  original: string;
  translations: Partial<Record<LangCode, string>>;
};

type Person = { name: string; lang: LangCode };

function pickMime() {
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const o of options) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(o)) {
      return o;
    }
  }
  return "";
}

/** Read a line aloud if the device actually has a voice for that language. */
function speak(text: string, lang: LangCode) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
  if (!match) return; // no voice installed — the caption carries it instead
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
  const [state, setState] = useState<"idle" | "live" | "busy">("idle");
  const [error, setError] = useState("");
  const [recap, setRecap] = useState("");
  const [ending, setEnding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideo, setShowVideo] = useState(true);

  const cursor = useRef(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const feedEnd = useRef<HTMLDivElement>(null);

  // Announce ourselves once.
  useEffect(() => {
    fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name, lang }),
    }).catch(() => {});
  }, [code, name, lang]);

  // Ask for a video room. If this fails the call still works without it.
  useEffect(() => {
    fetch("/api/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .then((d) => d.url && setVideoUrl(d.url))
      .catch(() => {});
  }, [code]);

  // Poll for new turns. Simple on purpose: no websockets to maintain, and a
  // 1.5s delay is invisible next to the translation time anyway.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/room/${code}?since=${cursor.current}`);
        if (!res.ok || !alive) return;
        const data = await res.json();
        setPeople(data.participants ?? []);
        if (data.messages?.length) {
          cursor.current = data.next;
          setMessages((prev) => [...prev, ...data.messages]);
          for (const m of data.messages as Msg[]) {
            if (m.sourceLang === lang) continue; // don't read your own words back
            const line = m.translations[lang] ?? m.original;
            speak(line, lang);
          }
        }
      } catch {
        /* transient network blips are fine, next tick will catch up */
      }
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [code, lang]);

  useEffect(() => {
    feedEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = useCallback(
    async (blob: Blob) => {
      setState("busy");
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
        setError("Could not reach the server. Check your connection.");
      } finally {
        setState("idle");
      }
    },
    [code, name, lang],
  );

  const start = useCallback(async () => {
    if (state !== "idle") return;
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
        else setState("idle");
      };
      rec.start();
      recorder.current = rec;
      setState("live");
    } catch {
      setError(t.micDenied);
    }
  }, [state, send, t.micDenied]);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

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

  const label =
    state === "live" ? t.speaking : state === "busy" ? t.sending : t.hold;

  return (
    <div className="room">
      <header className="roombar">
        <div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{t.codeLabel}</div>
          <strong style={{ letterSpacing: "0.15em" }}>{code}</strong>
        </div>
        <div className="who">
          {people.map((p) => (
            <span key={p.name} className={`tag tag-${p.lang}`}>
              {p.name} · {LANGS[p.lang].label}
            </span>
          ))}
        </div>
      </header>

      {error && <div className="notice">{error}</div>}

      {videoUrl && showVideo && (
        <div className="video">
          <iframe
            src={`${videoUrl}?userName=${encodeURIComponent(name)}`}
            allow="camera; microphone; autoplay; fullscreen"
            title="Video"
          />
        </div>
      )}

      <div className="feed">
        {!messages.length && (
          <p className="empty">{people.length < 2 ? t.waiting : t.nobodyYet}</p>
        )}

        {messages.map((m) => {
          const mine = m.sourceLang === lang;
          const shown = mine ? m.original : m.translations[lang] ?? m.original;
          return (
            <article key={m.id} className={`turn turn-${m.sourceLang}`}>
              <div className="speaker">{m.speaker}</div>
              <div className="said">{shown}</div>
              {!mine && <div className="source">{m.original}</div>}
            </article>
          );
        })}

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
          data-state={state}
          disabled={state === "busy"}
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
          onContextMenu={(e) => e.preventDefault()}
        >
          {label}
        </button>
        <div className="endline">
          {videoUrl && (
            <button onClick={() => setShowVideo((v) => !v)}>
              {showVideo ? t.hideVideo : t.showVideo}
            </button>
          )}
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
