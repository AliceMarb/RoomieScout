import { NextResponse } from "next/server";
import { scoreQuiz, type QuizAnswers } from "@/concepts/interview/quiz";
import { buildPersonaFromAxes, computeCompatibility } from "@/concepts/personas";
import { createPairingFromInterview, getPairing, updatePairing, generateCompatibilitySummary } from "@/concepts/pairing";

const PROCESSING_DELAY_MS = 2500;

export async function POST(req: Request) {
  let body: { answers?: unknown; flowId?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  if (!body.answers || typeof body.answers !== "object") {
    return NextResponse.json({ error: "answers is required" }, { status: 400 });
  }

  const answers = body.answers as QuizAnswers;
  const flowId = typeof body.flowId === "string" ? body.flowId : null;

  const persona = buildPersonaFromAxes(scoreQuiz(answers));

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
