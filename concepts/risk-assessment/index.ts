/**
 * Risk Assessment concept
 *
 * Purpose: Enable two people to receive a structured assessment of practical risks
 *   before committing to a shared living arrangement.
 *
 * Operational principle: Once access is authorized (see Purchase sync), the initiator
 *   provides both email addresses. Both receive invitations and each completes a
 *   private structured deep-dive. Together they receive a joint Readiness Report —
 *   a risk score and a specific alignment agenda — built to walk through before signing.
 *
 * Note: payment gating lives in the Purchase concept. RiskAssessment.create() is
 *   called by the sync once Purchase.complete() fires; this concept never references
 *   payment directly.
 *
 * State:
 *   a set of RiskAssessments with
 *     an initiatorEmail String
 *     a roommateEmail String
 *     a status of INVITED or IN_PROGRESS or COMPLETE
 *     an optional pairingId String         (link back to free compat pairing)
 *     an optional initiatorAnswers String  (private interview transcript)
 *     an optional roommateAnswers String
 *     an optional report ReadinessReport
 *     a createdAt DateTime
 *     an optional completedAt DateTime
 *
 * Actions:
 *   create(initiatorEmail, roommateEmail, pairingId?) — creates INVITED
 *   submitInitiatorAnswers(id, answers)  — requires INVITED; moves to IN_PROGRESS
 *   submitRoommateAnswers(id, answers)   — requires IN_PROGRESS; moves to COMPLETE
 *   attachReport(id, report)            — records the generated ReadinessReport
 *   getAssessment(id)                   — read state
 */

import { kv } from "@/infrastructure/kv";

export type AssessmentStatus = "invited" | "in_progress" | "complete";

export type AlignmentPoint = {
  topic: string;
  initiatorStance: string;
  roommateStance: string;
  aligned: boolean;
};

export type ReadinessReport = {
  riskScore: number;
  riskBand: "Low Risk" | "Moderate Risk" | "High Risk";
  alignmentPoints: AlignmentPoint[];
  aiNarrative: string;
};

export type RiskAssessment = {
  id: string;
  initiatorEmail: string;
  roommateEmail: string;
  status: AssessmentStatus;
  pairingId?: string;
  initiatorAnswers?: string;
  roommateAnswers?: string;
  report?: ReadinessReport;
  createdAt: string;
  completedAt?: string;
};

const TTL = 60 * 60 * 24 * 30; // 30 days

function key(id: string) {
  return `risk-assessment:${id}`;
}

export async function create(
  initiatorEmail: string,
  roommateEmail: string,
  pairingId?: string,
): Promise<RiskAssessment> {
  const assessment: RiskAssessment = {
    id: crypto.randomUUID(),
    initiatorEmail,
    roommateEmail,
    status: "invited",
    pairingId,
    createdAt: new Date().toISOString(),
  };
  await kv.set(key(assessment.id), assessment, { ex: TTL });
  return assessment;
}

export async function getAssessment(id: string): Promise<RiskAssessment | null> {
  return kv.get<RiskAssessment>(key(id));
}

export async function updateAssessment(
  id: string,
  patch: Partial<RiskAssessment>,
): Promise<RiskAssessment | null> {
  const existing = await kv.get<RiskAssessment>(key(id));
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  await kv.set(key(id), updated, { ex: TTL });
  return updated;
}

// requires status === "invited"
export async function submitInitiatorAnswers(
  id: string,
  answers: string,
): Promise<RiskAssessment | null> {
  const a = await getAssessment(id);
  if (!a || a.status !== "invited") return null;
  return updateAssessment(id, { initiatorAnswers: answers, status: "in_progress" });
}

// requires status === "in_progress"
export async function submitRoommateAnswers(
  id: string,
  answers: string,
): Promise<RiskAssessment | null> {
  const a = await getAssessment(id);
  if (!a || a.status !== "in_progress") return null;
  return updateAssessment(id, {
    roommateAnswers: answers,
    status: "complete",
    completedAt: new Date().toISOString(),
  });
}

// TODO: wire to an OpenAI call once report generation is built
export async function attachReport(
  id: string,
  report: ReadinessReport,
): Promise<RiskAssessment | null> {
  return updateAssessment(id, { report });
}
