// In-memory store for matching flows.
// TODO: replace with a real database. This store is lost on server restart and
// is not shared across multiple serverless instances.

import type { CompatibilityResult } from "@/lib/business-logic";

export type MatchingFlow = {
  id: string;
  initiatorInput: string; // page 1 (placeholder for AI assessment)
  initiatorEmail?: string; // page 2
  roommateInput?: string; // page 3 (placeholder for AI assessment)
  result?: CompatibilityResult; // computed when the roommate responds
  resultsReadyAt?: number; // Date.now() + delay; drives processing vs completed
  createdAt: string;
};

export type FlowStatus = "created" | "processing" | "completed";

// Keep the Map on globalThis so it survives Next.js dev hot-reloads.
const g = globalThis as unknown as { __flows?: Map<string, MatchingFlow> };
const flows = g.__flows ?? (g.__flows = new Map<string, MatchingFlow>());

export function createFlow(initiatorInput: string): MatchingFlow {
  const flow: MatchingFlow = {
    id: crypto.randomUUID(),
    initiatorInput,
    createdAt: new Date().toISOString(),
  };
  flows.set(flow.id, flow);
  return flow;
}

export function getFlow(id: string): MatchingFlow | undefined {
  return flows.get(id);
}

export function updateFlow(
  id: string,
  patch: Partial<MatchingFlow>,
): MatchingFlow | undefined {
  const flow = flows.get(id);
  if (!flow) return undefined;
  Object.assign(flow, patch);
  return flow;
}

export function getStatus(flow: MatchingFlow): FlowStatus {
  if (!flow.result || !flow.resultsReadyAt) return "created";
  return Date.now() >= flow.resultsReadyAt ? "completed" : "processing";
}
