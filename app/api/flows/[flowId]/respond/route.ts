import { NextResponse } from "next/server";
import { computeCompatibility } from "@/lib/business-logic";
import { getFlow, updateFlow } from "@/lib/store";
import { sendResultsEmail } from "@/lib/email";

const PROCESSING_DELAY_MS = 2500;

// POST /api/flows/[flowId]/respond — the roommate submits their input.
// Computes the result and notifies the initiator.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await params;
  const flow = getFlow(flowId);
  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const result = computeCompatibility(flow.initiatorInput, text);
  updateFlow(flowId, {
    roommateInput: text,
    result,
    resultsReadyAt: Date.now() + PROCESSING_DELAY_MS,
  });

  const emailStatus = flow.initiatorEmail ? `sending to ${flow.initiatorEmail}` : "no email saved";
  if (flow.initiatorEmail) {
    sendResultsEmail({ to: flow.initiatorEmail, flowId }).catch((err) =>
      console.error("[email] Failed to send results email:", err),
    );
  }

  return NextResponse.json({ ok: true, debug_email: emailStatus });
}
