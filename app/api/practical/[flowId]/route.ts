import { NextResponse } from "next/server";
import { getPairing, updatePairing } from "@/concepts/pairing";
import { runFlagRules, buildConversationList } from "@/concepts/pairing/flag-rules";
import { getPersonalityInteractions } from "@/concepts/personas/trait-pairings";
import type { PracticalProfile } from "@/concepts/pairing/practical-profile";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await params;

  let body: { profile?: unknown; role?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const role = body.role === "roommate" ? "roommate" : "initiator";
  const profile = body.profile as PracticalProfile | undefined;
  if (!profile) return NextResponse.json({ error: "profile is required" }, { status: 400 });

  const pairing = await getPairing(flowId);
  if (!pairing) return NextResponse.json({ error: "Flow not found" }, { status: 404 });

  const patch = role === "initiator"
    ? { initiatorPracticalProfile: profile }
    : { roommatePracticalProfile: profile };

  const updated = await updatePairing(flowId, patch);
  if (!updated) return NextResponse.json({ error: "Failed to update" }, { status: 500 });

  const aProfile = role === "initiator" ? profile : updated.initiatorPracticalProfile;
  const bProfile = role === "roommate" ? profile : updated.roommatePracticalProfile;

  if (aProfile && bProfile && updated.result && updated.initiatorPersona && updated.roommatePersona) {
    try {
      const setup = aProfile.setup ?? bProfile.setup;
      const flags = runFlagRules(aProfile, bProfile, setup);
      const personalityInteractions = getPersonalityInteractions(updated.initiatorPersona, updated.roommatePersona);
      const conversationList = buildConversationList(flags);
      await updatePairing(flowId, {
        result: { ...updated.result, practicalFlags: flags, personalityInteractions, conversationList },
      });
    } catch (err) {
      console.error("[practical] enrichment failed:", err);
    }
  }

  return NextResponse.json({ ok: true, redirectTo: `/results/${flowId}` });
}
