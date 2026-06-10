/**
 * Optional Weave/W&B tracing. Silently skipped if WANDB_API_KEY is not set.
 * Uses dynamic import so it never breaks the Next.js build.
 */

let _op: (<T extends (...args: never[]) => unknown>(fn: T) => T) | null = null;
let _initPromise: Promise<void> | null = null;

/** Initialize Weave once. Safe to call repeatedly — the work runs at most once. */
export function initWeave(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    if (!process.env.WANDB_API_KEY) return;
    try {
      const weave = await import("weave");
      await weave.init("alice-marbach-audible/Homi");
      _op = weave.op as typeof _op;
      console.log("[weave] Tracing initialized");
    } catch (err) {
      console.warn("[weave] Failed to initialize — tracing disabled:", err);
    }
  })();
  return _initPromise;
}

/**
 * Wrap an async function with Weave op tracing.
 *
 * Weave initializes lazily (the API key check + dynamic import happen on first
 * use), so the real `weave.op` wrapper is resolved at *call* time, not when this
 * helper runs at module load. The first invocation ensures init has completed,
 * then applies and memoizes the wrapper. If Weave is unavailable it falls back
 * to the original function.
 */
export function weavOp<T extends (...args: never[]) => Promise<unknown>>(fn: T): T {
  let wrapped: T | null = null;
  return (async (...args: Parameters<T>) => {
    if (!wrapped) {
      await initWeave();
      wrapped = _op ? _op(fn) : fn;
    }
    return wrapped(...args);
  }) as unknown as T;
}

/** `weave.op(...)`-style alias so call sites read like the real Weave SDK. */
export const weave = { op: weavOp };

/** Wrap an OpenAI client with Weave tracing. Falls back to the original client if Weave is not available. */
export async function wrapOpenAIClient<T>(client: T): Promise<T> {
  if (!process.env.WANDB_API_KEY) return client;
  try {
    const w = await import("weave");
    return w.wrapOpenAI(client as never) as T;
  } catch {
    return client;
  }
}
