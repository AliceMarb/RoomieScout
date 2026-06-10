import { kv } from "@/infrastructure/kv";
import { computePersona } from "@/concepts/personas";
import type { CompatibilityResult, Persona } from "@/concepts/personas";

export type Pairing = {
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

export type PairingStatus = "created" | "processing" | "completed";

const PAIRING_TTL_SECONDS = 86400; // 24 hours

function pairingKey(id: string): string {
  return `flow:${id}`;
}

export async function createPairing(initiatorInput: string): Promise<Pairing> {
  const pairing: Pairing = {
    id: crypto.randomUUID(),
    initiatorInput,
    initiatorPersona: computePersona(initiatorInput),
    createdAt: new Date().toISOString(),
  };
  await kv.set(pairingKey(pairing.id), pairing, { ex: PAIRING_TTL_SECONDS });
  return pairing;
}

export async function getPairing(id: string): Promise<Pairing | null> {
  const existing = await kv.get<Pairing>(pairingKey(id));
  if (existing) return existing;
  if (process.env.NODE_ENV !== "production" && id.startsWith("dev-")) {
    return seedDevPairing(id);
  }
  return null;
}

async function seedDevPairing(id: string): Promise<Pairing> {
  const label = id.slice("dev-".length) || "dev";
  const name = label.charAt(0).toUpperCase() + label.slice(1);
  const pairing: Pairing = {
    id,
    initiatorInput: `Dev-seeded persona "${name}": tidy, sociable, flexible schedule, likes clear house rules.`,
    initiatorPersona: computePersona(id),
    initiatorName: name,
    createdAt: new Date().toISOString(),
  };
  await kv.set(pairingKey(id), pairing, { ex: PAIRING_TTL_SECONDS });
  return pairing;
}

export async function updatePairing(
  id: string,
  patch: Partial<Pairing>,
): Promise<Pairing | null> {
  const pairing = await kv.get<Pairing>(pairingKey(id));
  if (!pairing) return null;
  const updated = { ...pairing, ...patch };
  await kv.set(pairingKey(id), updated, { ex: PAIRING_TTL_SECONDS });
  return updated;
}

export async function createPairingFromInterview(
  transcript: string,
  persona: Persona,
): Promise<Pairing> {
  const pairing: Pairing = {
    id: crypto.randomUUID(),
    initiatorInput: transcript,
    initiatorPersona: persona,
    createdAt: new Date().toISOString(),
  };
  await kv.set(pairingKey(pairing.id), pairing, { ex: PAIRING_TTL_SECONDS });
  return pairing;
}

export function getPairingStatus(pairing: Pairing): PairingStatus {
  if (!pairing.result || !pairing.resultsReadyAt) return "created";
  return Date.now() >= pairing.resultsReadyAt ? "completed" : "processing";
}
