import { NextResponse } from "next/server";
import { getFlow, getStatus } from "@/lib/store";

// GET /api/flows/[flowId] — current status and (once ready) the result.
// Polled by the results page while processing.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await params;
  const flow = getFlow(flowId);
  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const status = getStatus(flow);
  return NextResponse.json({
    status,
    result: status === "completed" ? flow.result : undefined,
  });
}
