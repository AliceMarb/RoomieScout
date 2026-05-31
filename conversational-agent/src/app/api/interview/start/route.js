import { NextResponse } from "next/server";
import { SCOUT_INTRO, INTERVIEW_QUESTIONS } from "@/questions/interview";
import { createSession, appendMessage } from "@/store/transcriptStore";
import { textToSpeech } from "@/services/elevenlabs";

export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    createSession(userId);
    const firstQuestion = INTERVIEW_QUESTIONS[0];

    appendMessage(userId, "ai", SCOUT_INTRO);
    appendMessage(userId, "ai", firstQuestion);

    const audioBuffer = await textToSpeech(`${SCOUT_INTRO} ${firstQuestion}`);

    return NextResponse.json({
      intro: SCOUT_INTRO,
      questionIndex: 0,
      question: firstQuestion,
      audio: audioBuffer ? audioBuffer.toString("base64") : null,
      done: false,
    });
  } catch (err) {
    console.error("[/api/interview/start]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
