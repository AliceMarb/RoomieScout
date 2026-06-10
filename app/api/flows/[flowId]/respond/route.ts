import { NextResponse } from "next/server";
import { computeCompatibility, computePersona } from "@/concepts/personas";
import type { Persona } from "@/concepts/personas";
import { getPairing, updatePairing, generateCompatibilitySummary } from "@/concepts/pairing";
import { sendNotification } from "@/concepts/notification";

const PROCESSING_DELAY_MS = 2500;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await params;
  const pairing = await getPairing(flowId);
  if (!pairing) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  let body: { text?: unknown; persona?: Persona };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const roommatePersona = body.persona ?? (typeof body.text === "string" ? computePersona(body.text.trim()) : null);
  if (!roommatePersona) {
    return NextResponse.json({ error: "text or persona is required" }, { status: 400 });
  }

  const roommateText = typeof body.text === "string" ? body.text.trim() : "";
  const result = computeCompatibility(pairing.initiatorPersona, roommatePersona);

  await updatePairing(flowId, {
    roommateInput: roommateText,
    roommatePersona,
    result,
    resultsReadyAt: Date.now() + PROCESSING_DELAY_MS,
  });

  // Generate AI summary + dealbreakers in background — updates result once ready
  generateCompatibilitySummary(
    pairing.initiatorInput,
    roommateText,
    result.score,
    pairing.initiatorName || "Person 1",
    pairing.roommateName || "Person 2",
  )
    .then(({ aiSummary, dealbreakers }) =>
      updatePairing(flowId, { result: { ...result, aiSummary, dealbreakers } }).catch(() => {})
    )
    .catch((err) => console.error("[summary] Failed:", err));

  const emailStatus = pairing.initiatorEmail ? `sending to ${pairing.initiatorEmail}` : "no email saved";
  if (pairing.initiatorEmail) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    sendNotification({ to: pairing.initiatorEmail, url: `${base}/results/${flowId}` }).catch((err) =>
      console.error("[notification] Failed to send results email:", err),
    );
  }

  return NextResponse.json({ ok: true, debug_email: emailStatus });
}
