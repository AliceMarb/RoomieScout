// In-memory KV fallback. Swap for a real KV client (e.g. Vercel KV / Upstash)
// by replacing the `store` Map with an authenticated client that exposes the
// same get/set interface. Set kvIsPersistent = true when a durable backend is wired.

const store = new Map<string, unknown>();

export const kvIsPersistent = false;

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    return (store.get(key) as T) ?? null;
  },
  async set(key: string, value: unknown): Promise<void> {
    store.set(key, value);
  },
};
