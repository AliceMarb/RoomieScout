import { kv } from "@vercel/kv";
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
  result?: CompatibilityResult;
  resultsReadyAt?: number;
  createdAt: string;
};

export type FlowStatus = "created" | "processing" | "completed";

const FLOW_TTL_SECONDS = 86400; // 24 hours

function flowKey(id: string): string {
  return `flow:${id}`;
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
  return kv.get<MatchingFlow>(flowKey(id));
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
