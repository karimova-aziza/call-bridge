import { Redis } from "@upstash/redis";
import type { LangCode } from "./langs";

export type Message = {
  id: string;
  ts: number;
  speaker: string;
  sourceLang: LangCode;
  original: string;
  translations: Partial<Record<LangCode, string>>;
};

export type Participant = { name: string; lang: LangCode };

/*
 * Rooms live in Upstash Redis so that every serverless function sees the same
 * data. If the Upstash env vars are missing we fall back to an in-memory map,
 * which is fine for `npm run dev` on one machine but will NOT work once
 * deployed (each request may hit a different instance).
 */

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const memory = new Map<string, unknown>();
const TTL = 60 * 60 * 6; // rooms expire after 6 hours

async function rpush(key: string, value: unknown) {
  if (redis) {
    await redis.rpush(key, JSON.stringify(value));
    await redis.expire(key, TTL);
    return;
  }
  const list = (memory.get(key) as unknown[]) ?? [];
  list.push(value);
  memory.set(key, list);
}

async function lrange<T>(key: string, start: number): Promise<T[]> {
  if (redis) {
    const raw = await redis.lrange<string | T>(key, start, -1);
    return raw.map((r) => (typeof r === "string" ? (JSON.parse(r) as T) : r));
  }
  const list = (memory.get(key) as T[]) ?? [];
  return list.slice(start);
}

export async function addMessage(code: string, msg: Message) {
  await rpush(`room:${code}:msgs`, msg);
}

export async function getMessages(code: string, since = 0): Promise<Message[]> {
  return lrange<Message>(`room:${code}:msgs`, since);
}

export async function addParticipant(code: string, p: Participant) {
  const key = `room:${code}:people`;
  if (redis) {
    await redis.hset(key, { [p.name]: p.lang });
    await redis.expire(key, TTL);
    return;
  }
  const obj = (memory.get(key) as Record<string, string>) ?? {};
  obj[p.name] = p.lang;
  memory.set(key, obj);
}

export async function getParticipants(code: string): Promise<Participant[]> {
  const key = `room:${code}:people`;
  const obj = redis
    ? ((await redis.hgetall(key)) as Record<string, string> | null)
    : (memory.get(key) as Record<string, string> | undefined);
  if (!obj) return [];
  return Object.entries(obj).map(([name, lang]) => ({
    name,
    lang: lang as LangCode,
  }));
}

export const storeIsPersistent = hasRedis;
