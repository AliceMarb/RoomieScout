import { NextResponse } from "next/server";
import { SCOUT_INTRO, SCOUT_INTRO_SPOKEN } from "@/concepts/interview/copy";
import { textToSpeech } from "@/concepts/voice";
import { createInitialInterviewState, getNextQuestion } from "@/concepts/interview";
import type { Message } from "@/concepts/interview";

export async function POST(req: Request) {
  try {
    const { flowId, tts } = (await req.json()) as { flowId?: string; tts?: boolean };

    const interviewState = createInitialInterviewState();
    const transcript: Message[] = [];

    const result = await getNextQuestion(transcript, interviewState);

    if ("done" in result) {
      return NextResponse.json({ error: "Failed to generate opening question" }, { status: 500 });
    }

    transcript.push({ speaker: "ai", text: SCOUT_INTRO });
    transcript.push({ speaker: "ai", text: result.question, domain: result.domain });

    const audioBuffer = tts
      ? await textToSpeech(`${SCOUT_INTRO_SPOKEN} ${result.question}`)
      : null;

    return NextResponse.json({
      intro: SCOUT_INTRO,
      question: result.question,
      domain: result.domain,
      audio: audioBuffer ? audioBuffer.toString("base64") : null,
      interviewState,
      transcript,
      flowId: flowId ?? null,
      done: false,
    });
  } catch (err) {
    console.error("[/api/interview/start]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
