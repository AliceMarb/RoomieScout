import { NextResponse } from "next/server";
import { getPairing } from "@/concepts/pairing";
import { onSaveLink } from "@/concepts/syncs";

// POST /api/flows/[flowId]/send-link — email someone their results link so they
// can save it (the link is easy to lose). Used from the results page.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await params;
  if (!(await getPairing(flowId))) {
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

  try {
    await onSaveLink(flowId, email);
  } catch (err) {
    console.error("[send-link] Failed to send:", err);
    return NextResponse.json({ error: "Could not send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
