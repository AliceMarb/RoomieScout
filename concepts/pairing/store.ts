import { kv } from "@/infrastructure/kv";
import { computePersona, buildPersonaFromAxes, computeCompatibility } from "@/concepts/personas";
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
  // NPSD (Neat/Private/Stable/Defined) vs NPFL (Neat/Private/Fluid/Laid-back)
  // Aligned on cleanliness + privacy (score 65); split on rhythm + rules.
  const alexPersona = buildPersonaFromAxes([
    { chosen: "left", strength: 78 },
    { chosen: "left", strength: 72 },
    { chosen: "left", strength: 80 },
    { chosen: "left", strength: 75 },
  ]);
  const jordanPersona = buildPersonaFromAxes([
    { chosen: "left", strength: 65 },
    { chosen: "left", strength: 68 },
    { chosen: "right", strength: 60 },
    { chosen: "right", strength: 70 },
  ]);
  const base = computeCompatibility(alexPersona, jordanPersona);
  const result: CompatibilityResult = {
    ...base,
    aiSummary:
      "Alex and Jordan share the same instinct for a clean, quiet home — neither wants loud nights or a revolving door of guests. Where they'll feel friction is structure: Alex runs on a schedule and wants expectations in writing, while Jordan is happy to work things out as they come up. A quick conversation about a few baseline agreements before move-in should get them most of the way there.",
    dealbreakers: [
      { topic: "Cleanliness", personA: "Cleans on a weekly schedule", personB: "Keeps things spotless naturally", compatible: true },
      { topic: "Guests", personA: "Quiet home, visitors by arrangement", personB: "Prefers to be unbothered", compatible: true },
      { topic: "Noise", personA: "Quiet hours strictly observed", personB: "Generally quiet, flexible on weekends", compatible: true },
      { topic: "Daily schedule", personA: "Consistent morning and evening routine", personB: "Hours vary, hard to predict", compatible: false },
      { topic: "House rules", personA: "Wants agreements in writing", personB: "Prefers to keep things informal", compatible: false },
      { topic: "Chores", personA: "Defined rota with clear expectations", personB: "Cleans when it needs it", compatible: false },
    ],
  };
  const pairing: Pairing = {
    id,
    initiatorInput: "Dev seed",
    initiatorPersona: alexPersona,
    initiatorName: "Alex",
    roommateInput: "Dev seed",
    roommatePersona: jordanPersona,
    roommateName: "Jordan",
    result,
    resultsReadyAt: Date.now() - 1000,
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
