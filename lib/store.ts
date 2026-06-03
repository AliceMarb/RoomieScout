import { kv } from "@/lib/kv";
import {
  computePersona,
  type CompatibilityResult,
  type Persona,
} from "@/lib/business-logic";

export type MatchingFlow = {
  id: string;
  initiatorInput: string;
  initiatorPersona: Persona;
  initiatorEmail?: string;
  initiatorName?: string;
  roommateInput?: string;
  roommatePersona?: Persona;
  roommateName?: string;
  roommateEmail?: string;
  result?: CompatibilityResult;
  resultsReadyAt?: number;
  createdAt: string;
};

export type FlowStatus = "created" | "processing" | "completed";

const FLOW_TTL_SECONDS = 86400; // 24 hours

function flowKey(id: string): string {
  return `flow:${id}`;
}

// Index for the "match by email" path: two people who each take the test on
// their own (no shared link) are paired by the unordered set of their two
// emails. Sorting + lowercasing makes the key identical no matter who submits
// first or which email each person types as "mine" vs "my roommate's".
function pairKey(emailA: string, emailB: string): string {
  const [x, y] = [emailA.trim().toLowerCase(), emailB.trim().toLowerCase()].sort();
  return `pair:${x}|${y}`;
}

export async function getPairedFlowId(
  emailA: string,
  emailB: string,
): Promise<string | null> {
  return kv.get<string>(pairKey(emailA, emailB));
}

export async function setPairedFlowId(
  emailA: string,
  emailB: string,
  flowId: string,
): Promise<void> {
  await kv.set(pairKey(emailA, emailB), flowId, { ex: FLOW_TTL_SECONDS });
}

export async function createFlow(initiatorInput: string): Promise<MatchingFlow> {
  const flow: MatchingFlow = {
    id: crypto.randomUUID(),
    initiatorInput,
    initiatorPersona: computePersona(initiatorInput),
    createdAt: new Date().toISOString(),
  };
  await kv.set(flowKey(flow.id), flow, { ex: FLOW_TTL_SECONDS });
  return flow;
}

export async function getFlow(id: string): Promise<MatchingFlow | null> {
  const existing = await kv.get<MatchingFlow>(flowKey(id));
  if (existing) return existing;
  // Dev shortcut: any id like `dev-alice` is auto-seeded on first access with a
  // stable hash-based persona, so you can jump straight to /share/dev-alice
  // without sitting through the interview. Local dev only (Vercel sets
  // NODE_ENV=production even on previews, so this never fires in deployments).
  if (process.env.NODE_ENV !== "production" && id.startsWith("dev-")) {
    return seedDevFlow(id);
  }
  return null;
}

async function seedDevFlow(id: string): Promise<MatchingFlow> {
  const label = id.slice("dev-".length) || "dev";
  const name = label.charAt(0).toUpperCase() + label.slice(1);
  const flow: MatchingFlow = {
    id,
    initiatorInput: `Dev-seeded persona "${name}": tidy, sociable, flexible schedule, likes clear house rules.`,
    initiatorPersona: computePersona(id),
    initiatorName: name,
    createdAt: new Date().toISOString(),
  };
  await kv.set(flowKey(id), flow, { ex: FLOW_TTL_SECONDS });
  return flow;
}

export async function updateFlow(
  id: string,
  patch: Partial<MatchingFlow>,
): Promise<MatchingFlow | null> {
  const flow = await kv.get<MatchingFlow>(flowKey(id));
  if (!flow) return null;
  const updated = { ...flow, ...patch };
  await kv.set(flowKey(id), updated, { ex: FLOW_TTL_SECONDS });
  return updated;
}

export async function createFlowFromInterview(
  transcript: string,
  persona: Persona,
): Promise<MatchingFlow> {
  const flow: MatchingFlow = {
    id: crypto.randomUUID(),
    initiatorInput: transcript,
    initiatorPersona: persona,
    createdAt: new Date().toISOString(),
  };
  await kv.set(flowKey(flow.id), flow, { ex: FLOW_TTL_SECONDS });
  return flow;
}

export function getStatus(flow: MatchingFlow): FlowStatus {
  if (!flow.result || !flow.resultsReadyAt) return "created";
  return Date.now() >= flow.resultsReadyAt ? "completed" : "processing";
}
