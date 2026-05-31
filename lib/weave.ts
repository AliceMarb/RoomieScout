/**
 * Optional Weave/W&B tracing. Silently skipped if WANDB_API_KEY is not set.
 * Uses dynamic import so it never breaks the Next.js build.
 */

let _op: (<T extends (...args: never[]) => unknown>(fn: T) => T) | null = null;

export async function initWeave() {
  if (!process.env.WANDB_API_KEY) return;
  try {
    const weave = await import("weave");
    await weave.init("alice-marbach-audible/RoomieScout");
    _op = weave.op as typeof _op;
    console.log("[weave] Tracing initialized");
  } catch (err) {
    console.warn("[weave] Failed to initialize — tracing disabled:", err);
  }
}

/** Wrap a function with Weave op tracing. Falls back to the original function if Weave is not available. */
export function weavOp<T extends (...args: never[]) => unknown>(fn: T): T {
  return _op ? _op(fn) : fn;
}

/** Wrap an OpenAI client with Weave tracing. Falls back to the original client if Weave is not available. */
export async function wrapOpenAIClient<T>(client: T): Promise<T> {
  if (!process.env.WANDB_API_KEY) return client;
  try {
    const weave = await import("weave");
    return weave.wrapOpenAI(client as never) as T;
  } catch {
    return client;
  }
}
