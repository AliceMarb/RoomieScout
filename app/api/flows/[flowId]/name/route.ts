import { NextResponse } from "next/server";
import { getFlow, updateFlow } from "@/lib/store";

// POST /api/flows/[flowId]/name — store a participant's display name so results
// show real names instead of "Person 1" / "Person 2".
// Body: { name: string, role: "initiator" | "roommate" }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await params;
  if (!(await getFlow(flowId))) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  let body: { name?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const role = body.role === "roommate" ? "roommate" : "initiator";
  await updateFlow(flowId, role === "roommate" ? { roommateName: name } : { initiatorName: name });

  return NextResponse.json({ ok: true });
}
