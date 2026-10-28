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

/*
 * VAD constants — tuned for a phone microphone in a quiet-ish room.
 *
 * SILENCE_THRESHOLD: RMS amplitude (0–1). 0.012 catches a normal speaking
 *   voice and ignores background hum. If users find it triggers on keyboard
 *   noise, raise to 0.018. If it misses quiet speech, lower to 0.008.
 *
 * SILENCE_DURATION: ms of quiet before we treat speech as finished. 900ms
 *   handles natural mid-sentence pauses without cutting off. Raise if
 *   speakers tend to think mid-sentence; lower if translation feels slow.
 *
 * MIN_BLOB_SIZE: bytes. Discards clips that are breath sounds or rustles
 *   rather than actual speech.
 */
const SILENCE_THRESHOLD = 0.02;
const SILENCE_DURATION = 1200;
const MIN_BLOB_SIZE = 3000;

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

/*
 * useVAD — Voice Activity Detection using the Web Audio API.
 *
 * Why this instead of a push-to-talk button:
 * The people using this are not comfortable with software. Asking a 60-year-old
 * to hold down a button while speaking in a stressful institutional call was the
 * biggest usability barrier we could see. VAD makes the interface disappear —
 * you just talk.
 *
 * How it works:
 * 1. Open the microphone as a continuous stream.
 * 2. Route it through an AnalyserNode that computes the RMS amplitude every
 *    frame (~60fps via requestAnimationFrame).
 * 3. When RMS crosses SILENCE_THRESHOLD → speech started, begin recording.
 * 4. When RMS drops below threshold for SILENCE_DURATION ms → speech ended,
 *    stop recorder and fire the callback with the audio blob.
 * 5. Discard blobs below MIN_BLOB_SIZE to avoid sending breath/noise.
 *
 * The microphone stays open the whole call. Only recording (and sending) is
 * gated on voice activity. Muting stops the loop; unmuting restarts it.
 */
type VadState = "idle" | "listening" | "speaking";

function useVAD(
  onSpeechEnd: (blob: Blob) => void,
  active: boolean,
  onError: (msg: string) => void,
) {
  const [vadState, setVadState] = useState<VadState>("idle");
  const [level, setLevel] = useState(0); // 0–1 for the visualiser
  const frameRef = useRef<number>(0);
  const silenceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakingRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    if (silenceRef.current) clearTimeout(silenceRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
    speakingRef.current = false;
    setVadState("idle");
    setLevel(0);
  }, []);

  useEffect(() => {
    if (!active) {
      stop();
      return;
    }

    let alive = true;
    const mime = pickMime();

    const startRecording = (stream: MediaStream) => {
      chunksRef.current = [];
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        if (!alive) return;
        const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
        if (blob.size >= MIN_BLOB_SIZE) onSpeechEnd(blob);
      };
      rec.start();
      recorderRef.current = rec;
    };

    const stopRecording = () => {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    };

    navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      .then((stream) => {
        if (!alive) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        setVadState("listening");

        const tick = () => {
          if (!alive) return;
          analyser.getByteTimeDomainData(data);

          // RMS amplitude
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setLevel(Math.min(rms / SILENCE_THRESHOLD, 1));

          if (rms > SILENCE_THRESHOLD) {
            if (!speakingRef.current) {
              speakingRef.current = true;
              setVadState("speaking");
              startRecording(stream);
            }
            if (silenceRef.current) clearTimeout(silenceRef.current);
            silenceRef.current = setTimeout(() => {
              if (!alive) return;
              speakingRef.current = false;
              setVadState("listening");
              stopRecording();
            }, SILENCE_DURATION);
          }

          frameRef.current = requestAnimationFrame(tick);
        };

        tick();
      })
      .catch(() => {
        if (alive) onError("mic");
      });

    return () => {
      alive = false;
      stop();
    };
  }, [active, onSpeechEnd, onError, stop]);

  return { vadState, level };
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
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [recap, setRecap] = useState("");
  const [ending, setEnding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideo, setShowVideo] = useState(true);
  const [micBlocked, setMicBlocked] = useState(false);

  const cursor = useRef(0);
  const feedEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name, lang }),
    }).catch(() => {});
  }, [code, name, lang]);

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
            if (m.sourceLang === lang) continue;
            const line = m.translations[lang] ?? m.original;
            speak(line, lang);
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
  }, [messages.length]);

  const send = useCallback(async (blob: Blob) => {
    setBusy(true);
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
      setBusy(false);
    }
  }, [code, name, lang]);

  const handleError = useCallback((type: string) => {
    if (type === "mic") setMicBlocked(true);
  }, []);

  // VAD runs whenever not muted and not already processing a clip
  const { vadState, level } = useVAD(send, !muted && !micBlocked, handleError);

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

  // Status label shown to the user
  const statusLabel =
    micBlocked ? t.micDenied :
    muted ? t.mute :
    busy ? t.sending :
    vadState === "speaking" ? t.speaking :
    t.listening;

  const dotState =
    micBlocked ? "error" :
    muted ? "muted" :
    busy ? "busy" :
    vadState;

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

      {videoUrl && showVideo && (
        <div className="video">
          <iframe
            src={`${videoUrl}?userName=${encodeURIComponent(name)}`}
            allow="camera; microphone; autoplay; fullscreen"
            title="Video"
          />
        </div>
      )}

      {error && <div className="notice">{error}</div>}

      <div className="feed">
        {!messages.length && (
          <p className="empty">{people.length < 2 ? t.waiting : t.nobodyYet}</p>
        )}
        {messages.map((m) => {
          const mine = m.sourceLang === lang;
          const shown = mine ? m.original : (m.translations[lang] ?? m.original);
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
              <button onClick={() => { navigator.clipboard?.writeText(recap); setCopied(true); }}>
                {copied ? t.recapCopied : t.copyRecap}
              </button>
            </div>
          </section>
        )}
        <div ref={feedEnd} />
      </div>

      <div className="talkbar">
        {/* Level visualiser + status */}
        <div className="mic-row">
          <div className="mic-vis" aria-hidden>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="mic-bar"
                style={{
                  "--h": `${Math.max(
                    15,
                    dotState === "speaking"
                      ? 15 + (level * 85) * (0.4 + 0.6 * Math.sin((i / 11) * Math.PI))
                      : 15,
                  )}%`,
                  "--delay": `${i * 30}ms`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="mic-info">
            <div className={`mic-dot mic-dot--${dotState}`} />
            <span className="mic-label">{statusLabel}</span>
          </div>

          <button
            className={`mute-btn${muted ? " mute-btn--on" : ""}`}
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? t.unmute : t.mute}
          >
            {muted ? "🎙️ " + t.unmute : "🔇 " + t.mute}
          </button>
        </div>

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
