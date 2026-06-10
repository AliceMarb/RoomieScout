import { NextResponse } from "next/server";
import { getPairing, getPairingStatus } from "@/concepts/pairing";

// GET /api/flows/[flowId] — current status and (once ready) the result.
// Polled by the results page while processing.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await params;
  const pairing = await getPairing(flowId);
  if (!pairing) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const status = getPairingStatus(pairing);
  return NextResponse.json({
    status,
    result: status === "completed" ? pairing.result : undefined,
    initiatorPersona: status === "completed" ? pairing.initiatorPersona : undefined,
    roommatePersona: status === "completed" ? pairing.roommatePersona : undefined,
    initiatorName: status === "completed" ? pairing.initiatorName : undefined,
    roommateName: status === "completed" ? pairing.roommateName : undefined,
  });
}
