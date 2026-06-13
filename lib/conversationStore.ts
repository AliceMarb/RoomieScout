import { kv } from "@/lib/kv";
import type { Message } from "@/concepts/interview/session";
import type { Persona } from "@/concepts/personas/types";

// Durable record of one completed interview conversation. Unlike the matching
// flow (lib/store.ts), these are persisted with NO TTL — they're the permanent
// record of what was said. Stored in KV when creds are present, otherwise in
// the in-memory fallback (lost on restart — see lib/kv.ts).

export type ConversationRecord = {
  id: string;
  /** The free-form interview userId, when one was supplied. */
  userId?: string;
  /** The matching flow this conversation produced/joined, if any. */
  flowId?: string;
  /** Whether this person started the flow or joined an existing one. */
  role?: "initiator" | "roommate";
  /** Full structured transcript: every turn with speaker + optional domain. */
  transcript: Message[];
  /** The persona the classifier assigned from this transcript. */
  persona?: Persona;
  createdAt: string;
};

function conversationKey(id: string): string {
  return `conversation:${id}`;
}

// KV has no cheap "scan all keys", so we keep an explicit index of every
// conversation id. Append-only; ids are added on save.
const INDEX_KEY = "conversation:index";

export async function saveConversation(
  input: Omit<ConversationRecord, "id" | "createdAt"> &
    Partial<Pick<ConversationRecord, "id" | "createdAt">>,
): Promise<ConversationRecord> {
  const record: ConversationRecord = {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  await kv.set(conversationKey(record.id), record); // no TTL — permanent

  const index = (await kv.get<string[]>(INDEX_KEY)) ?? [];
  if (!index.includes(record.id)) {
    await kv.set(INDEX_KEY, [...index, record.id]);
  }
  return record;
}

export async function getConversation(
  id: string,
): Promise<ConversationRecord | null> {
  return kv.get<ConversationRecord>(conversationKey(id));
}

export async function listConversationIds(): Promise<string[]> {
  return (await kv.get<string[]>(INDEX_KEY)) ?? [];
}

export async function listConversations(): Promise<ConversationRecord[]> {
  const ids = await listConversationIds();
  const records = await Promise.all(ids.map((id) => getConversation(id)));
  return records.filter((r): r is ConversationRecord => r !== null);
}
