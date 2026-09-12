# Call Bridge

A live interpreted call. Three people open the same link, each picks their own language, and hold a button to speak. Everyone else hears and reads it in their language. At the end, a written recap is generated in whichever language you choose.

Built for one situation: a parent who speaks Uzbek or Russian talking to their child's professor or advisor, with the student on the call too.

---

## How it works

Push-to-talk, not simultaneous interpretation. You hold the button, speak, and let go. The clip goes to the server, gets transcribed, translated into every other language in the room, and appears for everyone within a couple of seconds.

This is a deliberate choice, not a limitation to apologise for. Simultaneous interpretation needs sub-second latency and handles people talking over each other badly. Turn-taking is how human interpreters work in these conversations anyway, and it's clearer for an older speaker who isn't used to talking to software.

```
hold button → record clip → Whisper transcribes → LLM translates
   → stored in room → everyone polls → caption + spoken aloud
```

No websockets. Every client asks the server for new turns every 1.5 seconds. That's invisible next to the two seconds translation already takes, and it means the whole thing deploys to Vercel's free tier with nothing else running.

---

## Setup

### 1. Install

```bash
npm install
```

You need Node.js 18 or newer.

### 2. Get two free accounts

**Groq** — console.groq.com. Free, no credit card. Does both the speech-to-text and the translation. Create an API key.

**Upstash** — upstash.com. Free, no credit card. Create a Redis database, then copy the **REST URL** and **REST token** (not the Redis URL — the REST ones).

Upstash is needed because each request to a deployed app may land on a different server, so the room has to live somewhere shared. Locally you can skip it and it'll use memory instead, but then only one browser works.

### 3. Add your keys

Copy `.env.local.example` to `.env.local` and fill it in:

```
GROQ_API_KEY=gsk_...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

### 4. Run it

```bash
npm run dev
```

Open **localhost:3000**. Enter your name, pick English, start a call. Copy the code. Open a second browser window (use a private window, or a different browser), join with the same code, pick Russian. Talk into one and watch it appear in the other.

Microphone access only works on `localhost` or over HTTPS. It will silently fail if you open it over plain HTTP on your phone — deploy first for phone testing.

### 5. Deploy

Push to GitHub, import into Vercel, add the same three environment variables in the project settings, deploy.

---

## What's where

| File | What it does |
| --- | --- |
| `lib/prompt.ts` | **The product.** Translation prompt, recap prompt, and the glossary. |
| `lib/ui.ts` | Interface text in all three languages. |
| `lib/groq.ts` | Calls to Whisper and the LLM. |
| `lib/store.ts` | Room state in Redis. |
| `app/api/speak/route.ts` | The pipeline: audio in, translated turn out. |
| `app/room/[code]/page.tsx` | The call screen. |

---

## Two things to fix before you show anyone

**Check the Uzbek.** `lib/ui.ts` has interface text I wrote and can't verify. You're the native speaker. If the button your mother is meant to hold says something slightly wrong, the whole product fails at the first screen.

**Test whether Uzbek transcription actually works.** This is the biggest unknown in the project. Whisper handles Russian well and Uzbek unevenly. Record yourself speaking Uzbek, run it through, and see what comes back. If it's poor, the honest v1 is English in, Uzbek out — the professor speaks, the parent reads and hears the translation, the parent replies in Russian or through the student. Still useful, just a narrower claim.

Spoken output has the same gap. The app reads translations aloud using the voice built into the device, and most phones have no Uzbek voice installed. When there's no voice it stays silent and the caption carries it. Worth watching whether people notice.

---

## Known limits

- Two people talking at once doesn't work. Turn-taking is enforced by the interface.
- Rooms disappear after six hours.
- Anyone with the 4-character code can join. Fine for testing, not for anything private.
- No recording consent screen yet. Add one before you use this on a real call with a professor — it matters legally in some places and ethically everywhere.

---

## What to do next

Don't add features. Get five real calls through it and write down every single thing that goes wrong, in `notes.md`. The glossary in `lib/prompt.ts` should grow by a line after every one of those calls.
