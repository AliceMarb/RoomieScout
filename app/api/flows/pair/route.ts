import { NextResponse } from "next/server";
import { computeCompatibility } from "@/lib/personas";
import {
  getFlow,
  updateFlow,
  getPairedFlowId,
  setPairedFlowId,
} from "@/lib/store";
import { sendResultsEmail } from "@/lib/email";
import { generateCompatibilitySummary } from "@/lib/compatibilitySummary";

const PROCESSING_DELAY_MS = 2500;

// POST /api/flows/pair — the "match by email" rendezvous for two people who each
// take the test on their own, without a shared join link.
//
// Each person submits their own flowId (created by their interview), their email,
// and their roommate's email. We pair the two flows on the unordered email set:
//   - first to submit  → we record the index and tell them to wait.
//   - second to submit  → we find the partner's flow, compute compatibility,
//     write the result into BOTH flows (each from its own perspective), and
//     email BOTH people their own results link.
export async function POST(request: Request) {
  let body: { flowId?: unknown; email?: unknown; roommateEmail?: unknown; name?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const flowId = typeof body.flowId === "string" ? body.flowId : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const roommateEmail = typeof body.roommateEmail === "string" ? body.roommateEmail.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!flowId) return NextResponse.json({ error: "flowId is required" }, { status: 400 });
  if (!email || !roommateEmail) {
    return NextResponse.json({ error: "Both emails are required" }, { status: 400 });
  }
  if (email.toLowerCase() === roommateEmail.toLowerCase()) {
    return NextResponse.json({ error: "Enter two different emails" }, { status: 400 });
  }

  const myFlow = await getFlow(flowId);
  if (!myFlow) return NextResponse.json({ error: "Flow not found" }, { status: 404 });

  // Already matched (e.g. re-submitting after the partner finished) — send them on.
  if (myFlow.result && myFlow.resultsReadyAt) {
    return NextResponse.json({ status: "matched", flowId });
  }

  // Record this person's contact details on their own flow.
  await updateFlow(flowId, {
    initiatorEmail: email,
    roommateEmail,
    ...(name && { initiatorName: name }),
  });

  const partnerFlowId = await getPairedFlowId(email, roommateEmail);

  // Nobody waiting yet (or it's us re-submitting): register and wait.
  if (!partnerFlowId || partnerFlowId === flowId) {
    await setPairedFlowId(email, roommateEmail, flowId);
    return NextResponse.json({ status: "waiting" });
  }

  const partnerFlow = await getFlow(partnerFlowId);
  if (!partnerFlow) {
    // Stale index (partner's flow expired) — become the one who waits.
    await setPairedFlowId(email, roommateEmail, flowId);
    return NextResponse.json({ status: "waiting" });
  }

  // Both surveys are in — compute and fan the result out to both flows.
  const result = computeCompatibility(myFlow.initiatorPersona, partnerFlow.initiatorPersona);
  const readyAt = Date.now() + PROCESSING_DELAY_MS;

  await Promise.all([
    updateFlow(flowId, {
      roommatePersona: partnerFlow.initiatorPersona,
      roommateName: partnerFlow.initiatorName,
      result,
      resultsReadyAt: readyAt,
    }),
    updateFlow(partnerFlowId, {
      roommatePersona: myFlow.initiatorPersona,
      roommateName: name || myFlow.initiatorName,
      result,
      resultsReadyAt: readyAt,
    }),
  ]);

  // AI summary + dealbreakers in the background — applied to both flows once ready.
  generateCompatibilitySummary(
    myFlow.initiatorInput,
    partnerFlow.initiatorInput,
    result.score,
    name || myFlow.initiatorName || "Person 1",
    partnerFlow.initiatorName || "Person 2",
  )
    .then(({ aiSummary, dealbreakers }) =>
      Promise.all([
        updateFlow(flowId, { result: { ...result, aiSummary, dealbreakers } }),
        updateFlow(partnerFlowId, { result: { ...result, aiSummary, dealbreakers } }),
      ]).catch(() => {}),
    )
    .catch((err) => console.error("[pair] summary failed:", err));

  // Email both people their own results link (best-effort, never blocks).
  sendResultsEmail({ to: email, flowId }).catch((err) =>
    console.error("[pair] email to submitter failed:", err),
  );
  if (partnerFlow.initiatorEmail) {
    sendResultsEmail({ to: partnerFlow.initiatorEmail, flowId: partnerFlowId }).catch((err) =>
      console.error("[pair] email to partner failed:", err),
    );
  }

  return NextResponse.json({ status: "matched", flowId });
}
