import { NextResponse } from "next/server";
import { SCOUT_CLOSING } from "@/lib/interview";
import { getSession, appendMessage, advanceQuestion } from "@/lib/transcriptStore";
import { speechToText, textToSpeech } from "@/lib/elevenlabs";
import { getNextQuestion } from "@/lib/agents";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let userId: string | null;
    let userText: string;

    if (contentType.includes("application/json")) {
      // Text submission path
      const body = (await req.json()) as { userId?: string; text?: string };
      userId = body.userId ?? null;
      if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
      if (!body.text?.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });
      userText = body.text.trim();
    } else {
      // Audio submission path
      const formData = await req.formData();
      userId = formData.get("userId") as string | null;
      const audioFile = formData.get("audio") as File | null;
      if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
      if (!audioFile) return NextResponse.json({ error: "audio is required" }, { status: 400 });
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      userText = await speechToText(audioBuffer, audioFile.type || "audio/webm");
    }

    const session = getSession(userId);
    if (!session) {
      return NextResponse.json({ error: "Session not found. Call /start first." }, { status: 404 });
    }

    appendMessage(userId, "user", userText);

    const result = await getNextQuestion(session.transcript, session.interviewState);

    if ("done" in result) {
      appendMessage(userId, "ai", SCOUT_CLOSING);
      const closingAudio = await textToSpeech(SCOUT_CLOSING);

      return NextResponse.json({
        done: true,
        transcript: session.transcript,
        question: SCOUT_CLOSING,
        userTranscript: userText,
        audio: closingAudio ? closingAudio.toString("base64") : null,
      });
    }

    appendMessage(userId, "ai", result.question);
    advanceQuestion(userId);

    const questionAudio = await textToSpeech(result.question);

    return NextResponse.json({
      questionIndex: session.currentQuestionIndex,
      question: result.question,
      userTranscript: userText,
      audio: questionAudio ? questionAudio.toString("base64") : null,
      done: false,
    });
  } catch (err) {
    console.error("[/api/interview/respond]", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
