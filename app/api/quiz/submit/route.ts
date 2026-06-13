import { NextResponse } from "next/server";
import {
  NEUTRAL_AXIS_QUESTIONS,
  PAIR_QUESTIONS,
  BLOCK_QUESTIONS,
  FREQUENCY_QUESTIONS,
  computeAxisResults,
  type Answers,
  type AxisResult,
} from "@/concepts/risk-assessment/quiz-v2";
import { buildPersonaFromAxes, computeCompatibility } from "@/concepts/personas";
import { createPairingFromInterview, getPairing, updatePairing, generateCompatibilitySummary } from "@/concepts/pairing";

const PROCESSING_DELAY_MS = 2500;

/**
 * Convert quiz-v2 AxisResult[] to the format buildPersonaFromAxes expects.
 *
 * quiz-v2 AXES order:  [cleanliness, social, conflict, structure]
 * HMTI_AXES order:     [cleanliness, social, rhythm(=structure), rules(=conflict)]
 *
 * Swap indices 2 and 3 to align the two.
 */
function axisResultsToChoices(results: AxisResult[]) {
  const reordered = [results[0], results[1], results[3], results[2]];
  return reordered.map((r) => ({
    chosen: (r.score >= 50 ? "left" : "right") as "left" | "right",
    strength: Math.round(55 + (Math.abs(r.score - 50) / 50) * 40),
  }));
}

export async function POST(req: Request) {
  let body: { answers?: unknown; flowId?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  if (!body.answers || typeof body.answers !== "object") {
    return NextResponse.json({ error: "answers is required" }, { status: 400 });
  }

  const answers = body.answers as Answers;
  const flowId = typeof body.flowId === "string" ? body.flowId : null;

  const axisResults = computeAxisResults(
    NEUTRAL_AXIS_QUESTIONS, answers, PAIR_QUESTIONS, BLOCK_QUESTIONS, FREQUENCY_QUESTIONS,
  );
  const persona = buildPersonaFromAxes(axisResultsToChoices(axisResults));

  if (flowId) {
    const pairing = await getPairing(flowId);
    if (!pairing) return NextResponse.json({ error: "Flow not found" }, { status: 404 });

    const compat = computeCompatibility(pairing.initiatorPersona, persona);
    const readyAt = Date.now() + PROCESSING_DELAY_MS;

    await updatePairing(flowId, { roommatePersona: persona, result: compat, resultsReadyAt: readyAt });

    generateCompatibilitySummary(
      pairing.initiatorInput, JSON.stringify(answers), compat.score,
      pairing.initiatorName || "Person 1", "Person 2",
    )
      .then(({ aiSummary }) =>
        updatePairing(flowId, { result: { ...compat, aiSummary } }).catch(() => {}),
      )
      .catch((err: unknown) => console.error("[quiz/submit] summary failed:", err));

    return NextResponse.json({ redirectTo: `/results/${flowId}`, persona, flowId });
  }

  const pairing = await createPairingFromInterview(JSON.stringify(answers), persona);
  return NextResponse.json({ redirectTo: `/share/${pairing.id}`, persona, flowId: pairing.id });
}
