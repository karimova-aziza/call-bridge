/*
 * Video is handled by Daily.co so we don't have to run WebRTC ourselves.
 *
 * Deliberate choice: Daily rooms start with audio OFF. All speech goes through
 * our own push-to-talk translation layer instead. If both were live, everyone
 * would hear the untranslated original talking over the translation, which is
 * worse than no video at all. Video here is for presence — faces, nodding,
 * seeing that the other person is still there — not for sound.
 */

const DAILY = "https://api.daily.co/v1";

function key() {
  const k = process.env.DAILY_API_KEY;
  if (!k) throw new Error("DAILY_API_KEY is missing. Add it to .env.local");
  return k;
}

function roomName(code: string) {
  return `callbridge-${code.toLowerCase()}`;
}

/** Returns the room URL, creating the room the first time someone asks. */
export async function ensureVideoRoom(code: string): Promise<string> {
  const name = roomName(code);
  const headers = {
    Authorization: `Bearer ${key()}`,
    "Content-Type": "application/json",
  };

  // Already there? Reuse it.
  const existing = await fetch(`${DAILY}/rooms/${name}`, { headers });
  if (existing.ok) {
    const data = await existing.json();
    return data.url as string;
  }

  const res = await fetch(`${DAILY}/rooms`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name,
      privacy: "public",
      properties: {
        start_audio_off: true,
        start_video_off: false,
        enable_chat: false,
        enable_screenshare: false,
        enable_people_ui: false,
        // Rooms self-destruct after 4 hours so we don't accumulate stale ones.
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        eject_at_room_exp: true,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Could not create video room: ${await res.text()}`);
  }
  const data = await res.json();
  return data.url as string;
}
