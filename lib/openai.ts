import OpenAI from "openai";
import { initWeave, wrapOpenAIClient } from "@/lib/weave";

export const MODEL = "gpt-5.4-mini";

let _client: OpenAI | null = null;
let _weaveReady = false;

export async function getOpenAIAsync(): Promise<OpenAI> {
  if (!_weaveReady) {
    _weaveReady = true;
    await initWeave();
    if (_client) {
      _client = await wrapOpenAIClient(_client);
    }
  }
  if (!_client) {
    const base = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    _client = await wrapOpenAIClient(base);
  }
  return _client;
}

// Sync fallback for any code that hasn't migrated yet
export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}
