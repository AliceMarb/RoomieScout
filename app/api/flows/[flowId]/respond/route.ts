import { NextResponse } from "next/server";
import { computeCompatibility } from "@/lib/business-logic";
import { getFlow, updateFlow } from "@/lib/store";

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

  // TODO: send an email to flow.initiatorEmail with a link to /results/[flowId].
  if (flow.initiatorEmail) {
    console.log(
      `[TODO email] Results ready for flow ${flowId} — notify ${flow.initiatorEmail}: /results/${flowId}`,
    );
  }

  return NextResponse.json({ ok: true });
}
