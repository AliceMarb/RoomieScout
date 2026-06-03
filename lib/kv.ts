import { kv as vercelKv } from "@vercel/kv";

// Shared KV client. In production (Vercel) we use @vercel/kv. When the KV env
// vars are absent (local dev), fall back to an in-memory Map on globalThis so
// the app works without external credentials. The TTL option is accepted and
// ignored by the fallback. Both lib/store.ts (flows) and lib/conversationStore.ts
// (conversation records) build on this.
export type KvLike = {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex?: number }): Promise<unknown>;
};

const hasKvCreds = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
);

const g = globalThis as unknown as { __kvFallback?: Map<string, unknown> };
const mem = g.__kvFallback ?? (g.__kvFallback = new Map<string, unknown>());

const memoryKv: KvLike = {
  async get<T>(key: string): Promise<T | null> {
    return (mem.get(key) as T) ?? null;
  },
  async set(key: string, value: unknown): Promise<unknown> {
    mem.set(key, value);
    return "OK";
  },
};

/** True when real Vercel KV creds are present; false means the in-memory fallback is in use. */
export const kvIsPersistent = hasKvCreds;

export const kv: KvLike = hasKvCreds ? (vercelKv as unknown as KvLike) : memoryKv;
