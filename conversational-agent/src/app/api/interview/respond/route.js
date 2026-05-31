import { NextResponse } from "next/server";
import { INTERVIEW_QUESTIONS } from "@/questions/interview";
import { getSession, appendMessage, advanceQuestion } from "@/store/transcriptStore";
import { speechToText, textToSpeech } from "@/services/elevenlabs";

export async function POST(req) {
  try {
  const formData = await req.formData();
  const userId = formData.get("userId");
  const audioFile = formData.get("audio");

  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
  if (!audioFile) return NextResponse.json({ error: "audio is required" }, { status: 400 });

  const session = getSession(userId);
  if (!session) return NextResponse.json({ error: "Session not found. Call /start first." }, { status: 404 });

  const arrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);
  const userText = await speechToText(audioBuffer, audioFile.type || "audio/webm");

  appendMessage(userId, "user", userText);
  advanceQuestion(userId);

  const nextIndex = session.currentQuestionIndex;

  if (nextIndex >= INTERVIEW_QUESTIONS.length) {
    return NextResponse.json({ done: true, transcript: session.transcript });
  }

  const nextQuestion = INTERVIEW_QUESTIONS[nextIndex];
  appendMessage(userId, "ai", nextQuestion);
  const questionAudio = await textToSpeech(nextQuestion);

  return NextResponse.json({
    questionIndex: nextIndex,
    question: nextQuestion,
    userTranscript: userText,
    audio: questionAudio ? questionAudio.toString("base64") : null,
    done: false,
  });
  } catch (err) {
    console.error("[/api/interview/respond]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
