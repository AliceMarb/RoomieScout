import { NextResponse } from "next/server";
import { computeCompatibility, computePersona } from "@/lib/business-logic";
import type { Persona } from "@/lib/business-logic";
import { getFlow, updateFlow } from "@/lib/store";
import { sendResultsEmail } from "@/lib/email";

const PROCESSING_DELAY_MS = 2500;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await params;
  const flow = getFlow(flowId);
  if (!flow) {
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

  const result = computeCompatibility(flow.initiatorPersona, roommatePersona);
  updateFlow(flowId, {
    roommateInput: typeof body.text === "string" ? body.text.trim() : "",
    roommatePersona,
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
