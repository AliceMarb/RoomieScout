import { NextResponse } from "next/server";
import { createFlow } from "@/lib/store";

// POST /api/flows — create a new matching flow from the initiator's input.
export async function POST(request: Request) {
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

  const flow = await createFlow(text);
  return NextResponse.json({ flowId: flow.id });
}
