import { NextResponse } from "next/server";
import { getSession, getAllTranscripts } from "@/concepts/interview";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all");
  const userId = searchParams.get("userId");

  if (all === "true") {
    return NextResponse.json(getAllTranscripts());
  }

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const session = getSession(userId);
  if (!session) {
    return NextResponse.json({ error: "No session found" }, { status: 404 });
  }

  return NextResponse.json({ userId, transcript: session.transcript });
}
