// Rendezvous concept — lets two people who can't share a link find each other by naming each other.
// The key is the unordered pair of emails (lowercased + sorted) so both people produce the same key.

import { kv } from "@/infrastructure/kv";

const RENDEZVOUS_TTL_SECONDS = 86400; // 24 hours

function rendezvousKey(emailA: string, emailB: string): string {
  const [x, y] = [emailA.trim().toLowerCase(), emailB.trim().toLowerCase()].sort();
  return `pair:${x}|${y}`;
}

export async function getRendezvousMatch(
  emailA: string,
  emailB: string,
): Promise<string | null> {
  return kv.get<string>(rendezvousKey(emailA, emailB));
}

export async function registerRendezvous(
  emailA: string,
  emailB: string,
  pairingId: string,
): Promise<void> {
  await kv.set(rendezvousKey(emailA, emailB), pairingId, { ex: RENDEZVOUS_TTL_SECONDS });
}
