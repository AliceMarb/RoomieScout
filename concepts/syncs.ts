/**
 * Syncs — cross-concept wiring for RoomieScout.
 *
 * Each function here implements one or more syncs from docs/CONCEPTS.md.
 * All app-specific logic (which concepts fire when) lives here;
 * concepts themselves never reference each other.
 *
 * API routes are the HTTP presentation layer: they parse requests and call
 * these syncs. Concepts handle their own state.
 */

import { classifyPersona, formatTranscript } from "@/concepts/interview";
import type { Message } from "@/concepts/interview";
import {
  getPairing,
  updatePairing,
  createPairingFromInterview,
  generateCompatibilitySummary,
} from "@/concepts/pairing";
import type { Pairing } from "@/concepts/pairing";
import { computeCompatibility } from "@/concepts/personas";
import type { Persona } from "@/concepts/personas";
import { sendNotification } from "@/concepts/notification";

function resultsUrl(pairingId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/results/${pairingId}`;
}

/**
 * sync classifyOnCompletion + createPairing (initiator) or computeWhenReady (joiner).
 *
 * Called when Interview.respond signals "done". Classifies the participant's
 * persona, then either creates a new pairing (initiator path) or computes
 * the compatibility result and notifies the initiator (joiner path).
 */
export async function onInterviewComplete(
  transcript: Message[],
  pairingId: string | null,
): Promise<{ persona: Persona; redirectTo: string }> {
  const persona = await classifyPersona(transcript);
  const transcriptText = formatTranscript(transcript);

  if (pairingId) {
    // Joiner path — sync: computeWhenReady
    const pairing = await getPairing(pairingId);
    if (pairing) {
      const result = computeCompatibility(pairing.initiatorPersona, persona);
      await updatePairing(pairingId, {
        roommateInput: transcriptText,
        roommatePersona: persona,
        result,
        resultsReadyAt: Date.now() + 2500,
      });
      scheduleAiSummary(
        pairingId,
        pairing.initiatorInput,
        transcriptText,
        result.score,
        pairing.initiatorName,
        pairing.roommateName,
        result,
      );
      // sync: Notification.send to initiator
      if (pairing.initiatorEmail) {
        sendNotification({ to: pairing.initiatorEmail, url: resultsUrl(pairingId) }).catch((err) =>
          console.error("[syncs] notification to initiator failed:", err),
        );
      }
    }
    return { persona, redirectTo: `/results/${pairingId}` };
  } else {
    // Initiator path — sync: createPairing
    const pairing = await createPairingFromInterview(transcriptText, persona);
    return { persona, redirectTo: `/share/${pairing.id}` };
  }
}

/**
 * sync matchByEmail — when Rendezvous.register returns a match, pair both
 * participants, compute compatibility, and notify both by email.
 */
export async function onMatchByEmail(
  myPairing: Pairing,
  partnerPairing: Pairing,
  myEmail: string,
  myName: string,
): Promise<void> {
  const result = computeCompatibility(myPairing.initiatorPersona, partnerPairing.initiatorPersona);
  const readyAt = Date.now() + 2500;

  await Promise.all([
    updatePairing(myPairing.id, {
      roommatePersona: partnerPairing.initiatorPersona,
      roommateName: partnerPairing.initiatorName,
      result,
      resultsReadyAt: readyAt,
    }),
    updatePairing(partnerPairing.id, {
      roommatePersona: myPairing.initiatorPersona,
      roommateName: myName || myPairing.initiatorName,
      result,
      resultsReadyAt: readyAt,
    }),
  ]);

  scheduleAiSummary(
    myPairing.id,
    myPairing.initiatorInput,
    partnerPairing.initiatorInput,
    result.score,
    myName || myPairing.initiatorName,
    partnerPairing.initiatorName,
    result,
    partnerPairing.id,
  );

  // sync: Notification.send to both
  sendNotification({ to: myEmail, url: resultsUrl(myPairing.id) }).catch((err) =>
    console.error("[syncs] notification to submitter failed:", err),
  );
  if (partnerPairing.initiatorEmail) {
    sendNotification({ to: partnerPairing.initiatorEmail, url: resultsUrl(partnerPairing.id) }).catch((err) =>
      console.error("[syncs] notification to partner failed:", err),
    );
  }
}

/**
 * sync saveLink — a person asks to keep their results link.
 */
export async function onSaveLink(pairingId: string, email: string): Promise<void> {
  await sendNotification({ to: email, url: resultsUrl(pairingId), kind: "saved" });
}

// Fires the AI summary generation in the background and patches the result
// into one or both pairings once ready.
function scheduleAiSummary(
  pairingId: string,
  transcriptA: string,
  transcriptB: string,
  score: number,
  nameA: string | undefined,
  nameB: string | undefined,
  baseResult: Parameters<typeof updatePairing>[1]["result"] & object,
  partnerPairingId?: string,
): void {
  generateCompatibilitySummary(
    transcriptA,
    transcriptB,
    score,
    nameA || "Person 1",
    nameB || "Person 2",
  )
    .then(({ aiSummary, dealbreakers }) => {
      const patched = { ...baseResult, aiSummary, dealbreakers };
      const updates: Promise<unknown>[] = [
        updatePairing(pairingId, { result: patched }).catch(() => {}),
      ];
      if (partnerPairingId) {
        updates.push(updatePairing(partnerPairingId, { result: patched }).catch(() => {}));
      }
      return Promise.all(updates);
    })
    .catch((err) => console.error("[syncs] AI summary failed:", err));
}
