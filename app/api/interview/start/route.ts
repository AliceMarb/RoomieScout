import { NextResponse } from "next/server";
import { SCOUT_INTRO } from "@/lib/interview";
import { createSession, appendMessage } from "@/lib/transcriptStore";
import { textToSpeech } from "@/lib/elevenlabs";
import { createInitialInterviewState, getNextQuestion } from "@/lib/agents";

export async function POST(req: Request) {
  try {
    const { userId, tts } = (await req.json()) as { userId?: string; tts?: boolean };
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const interviewState = createInitialInterviewState();
    const session = createSession(userId, interviewState);

    const result = await getNextQuestion(session.transcript, interviewState);

    if ("done" in result) {
      return NextResponse.json({ error: "Failed to generate opening question" }, { status: 500 });
    }

    appendMessage(userId, "ai", SCOUT_INTRO);
    appendMessage(userId, "ai", result.question, result.domain);

    const audioBuffer = tts ? await textToSpeech(`${SCOUT_INTRO} ${result.question}`) : null;

    return NextResponse.json({
      intro: SCOUT_INTRO,
      questionIndex: 0,
      question: result.question,
      domain: result.domain,
      audio: audioBuffer ? audioBuffer.toString("base64") : null,
      done: false,
    });
  } catch (err) {
    console.error("[/api/interview/start]", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
