import { NextResponse } from "next/server";
import { getFlow, updateFlow } from "@/lib/store";

// POST /api/flows/[flowId]/email — store the initiator's email so we can notify
// them when results are ready.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await params;
  if (!getFlow(flowId)) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  updateFlow(flowId, { initiatorEmail: email });
  return NextResponse.json({ ok: true });
}
