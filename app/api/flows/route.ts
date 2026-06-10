import { NextResponse } from "next/server";
import { createPairing } from "@/concepts/pairing";

// POST /api/flows — create a new pairing from the initiator's input.
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

  const pairing = await createPairing(text);
  return NextResponse.json({ flowId: pairing.id });
}
