import { NextResponse } from "next/server";
import { getPairing, updatePairing } from "@/concepts/pairing";
import { getRendezvousMatch, registerRendezvous } from "@/concepts/rendezvous";
import { onMatchByEmail } from "@/concepts/syncs";

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

  const myPairing = await getPairing(flowId);
  if (!myPairing) return NextResponse.json({ error: "Flow not found" }, { status: 404 });

  // Already matched (e.g. re-submitting after the partner finished) — send them on.
  if (myPairing.result && myPairing.resultsReadyAt) {
    return NextResponse.json({ status: "matched", flowId });
  }

  // Record this person's contact details on their own pairing.
  await updatePairing(flowId, {
    initiatorEmail: email,
    roommateEmail,
    ...(name && { initiatorName: name }),
  });

  const partnerFlowId = await getRendezvousMatch(email, roommateEmail);

  // Nobody waiting yet (or it's us re-submitting): register and wait.
  if (!partnerFlowId || partnerFlowId === flowId) {
    await registerRendezvous(email, roommateEmail, flowId);
    return NextResponse.json({ status: "waiting" });
  }

  const partnerPairing = await getPairing(partnerFlowId);
  if (!partnerPairing) {
    // Stale index (partner's pairing expired) — become the one who waits.
    await registerRendezvous(email, roommateEmail, flowId);
    return NextResponse.json({ status: "waiting" });
  }

  // sync: matchByEmail — both are in, compute and fan out (best-effort, non-blocking).
  onMatchByEmail(
    { ...myPairing, initiatorEmail: email, roommateEmail, ...(name && { initiatorName: name }) },
    partnerPairing,
    email,
    name,
  ).catch((err) => console.error("[pair] matchByEmail sync failed:", err));

  return NextResponse.json({ status: "matched", flowId });
}
