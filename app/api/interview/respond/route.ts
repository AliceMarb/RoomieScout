import { NextResponse } from "next/server";
import { SCOUT_CLOSING } from "@/lib/interview";
import { getSession, appendMessage, advanceQuestion } from "@/lib/transcriptStore";
import { speechToText, textToSpeech } from "@/lib/elevenlabs";
import { getNextQuestion, classifyPersona } from "@/lib/agents";
import { createFlowFromInterview, getFlow, updateFlow } from "@/lib/store";
import { computeCompatibility } from "@/lib/business-logic";
import { formatTranscript } from "@/lib/agents/format";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let userId: string | null;
    let userText: string;

    let tts = false;
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { userId?: string; text?: string; tts?: boolean };
      userId = body.userId ?? null;
      if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
      if (!body.text?.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });
      userText = body.text.trim();
      tts = body.tts === true;
    } else {
      const formData = await req.formData();
      userId = formData.get("userId") as string | null;
      const audioFile = formData.get("audio") as File | null;
      if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
      if (!audioFile) return NextResponse.json({ error: "audio is required" }, { status: 400 });
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      userText = await speechToText(audioBuffer, audioFile.type || "audio/webm");
      tts = formData.get("tts") === "true";
    }

    const session = getSession(userId);
    if (!session) {
      return NextResponse.json({ error: "Session not found. Call /start first." }, { status: 404 });
    }

    appendMessage(userId, "user", userText);

    const result = await getNextQuestion(session.transcript, session.interviewState);

    if ("done" in result) {
      appendMessage(userId, "ai", SCOUT_CLOSING);

      const [closingAudio, persona] = await Promise.all([
        tts ? textToSpeech(SCOUT_CLOSING) : Promise.resolve(null),
        classifyPersona(session.transcript),
      ]);

      const transcriptText = formatTranscript(session.transcript);
      const flowId = session.flowId;
      let redirectTo: string;

      if (flowId) {
        const flow = getFlow(flowId);
        if (flow) {
          const compat = computeCompatibility(flow.initiatorPersona, persona);
          updateFlow(flowId, {
            roommateInput: transcriptText,
            roommatePersona: persona,
            result: compat,
            resultsReadyAt: Date.now() + 2500,
          });
        }
        redirectTo = `/results/${flowId}`;
      } else {
        const flow = createFlowFromInterview(transcriptText, persona);
        redirectTo = `/share/${flow.id}`;
      }

      return NextResponse.json({
        done: true,
        transcript: session.transcript,
        question: SCOUT_CLOSING,
        userTranscript: userText,
        audio: closingAudio ? closingAudio.toString("base64") : null,
        persona,
        flowId: flowId ?? redirectTo.split("/").pop(),
        redirectTo,
      });
    }

    appendMessage(userId, "ai", result.question, result.domain);
    advanceQuestion(userId);

    const questionAudio = tts ? await textToSpeech(result.question) : null;

    return NextResponse.json({
      questionIndex: session.currentQuestionIndex,
      question: result.question,
      domain: result.domain,
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
