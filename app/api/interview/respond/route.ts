import { NextResponse } from "next/server";
import { SCOUT_CLOSING, SCOUT_DIDNT_HEAR, SCOUT_DIDNT_HEAR_SPOKEN } from "@/concepts/interview/copy";
import { speechToText, textToSpeech } from "@/concepts/voice";
import { getNextQuestion } from "@/concepts/interview";
import type { InterviewState, Message } from "@/concepts/interview";
import { onInterviewComplete } from "@/concepts/syncs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let userText: string;
    let tts = false;
    let interviewState: InterviewState;
    let transcript: Message[];
    let flowId: string | null = null;

    if (contentType.includes("application/json")) {
      const body = (await req.json()) as {
        text?: string;
        tts?: boolean;
        interviewState?: InterviewState;
        transcript?: Message[];
        flowId?: string | null;
      };
      if (!body.text?.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });
      if (!body.interviewState) return NextResponse.json({ error: "interviewState is required" }, { status: 400 });
      userText = body.text.trim();
      tts = body.tts === true;
      interviewState = body.interviewState;
      transcript = body.transcript ?? [];
      flowId = body.flowId ?? null;
    } else {
      const formData = await req.formData();
      const audioFile = formData.get("audio") as File | null;
      if (!audioFile) return NextResponse.json({ error: "audio is required" }, { status: 400 });
      const stateRaw = formData.get("interviewState") as string | null;
      if (!stateRaw) return NextResponse.json({ error: "interviewState is required" }, { status: 400 });
      userText = await speechToText(Buffer.from(await audioFile.arrayBuffer()), audioFile.type || "audio/webm");
      tts = formData.get("tts") === "true";
      interviewState = JSON.parse(stateRaw);
      transcript = JSON.parse((formData.get("transcript") as string) ?? "[]");
      flowId = (formData.get("flowId") as string | null) ?? null;
    }

    if (userText.length < 3) {
      const retryAudio = tts ? await textToSpeech(SCOUT_DIDNT_HEAR_SPOKEN) : null;
      return NextResponse.json({
        done: false,
        question: SCOUT_DIDNT_HEAR,
        audio: retryAudio ? retryAudio.toString("base64") : null,
        interviewState,
        transcript,
      });
    }

    transcript.push({ speaker: "user", text: userText });

    const result = await getNextQuestion(transcript, interviewState);

    if ("done" in result) {
      transcript.push({ speaker: "ai", text: SCOUT_CLOSING });

      const [closingAudio, { persona, redirectTo }] = await Promise.all([
        tts ? textToSpeech(SCOUT_CLOSING) : Promise.resolve(null),
        onInterviewComplete(transcript, flowId),
      ]);

      return NextResponse.json({
        done: true,
        question: SCOUT_CLOSING,
        userTranscript: userText,
        audio: closingAudio ? closingAudio.toString("base64") : null,
        persona,
        redirectTo,
        transcript,
        interviewState,
      });
    }

    transcript.push({ speaker: "ai", text: result.question, domain: result.domain });
    const questionAudio = tts ? await textToSpeech(result.question) : null;

    return NextResponse.json({
      question: result.question,
      domain: result.domain,
      userTranscript: userText,
      audio: questionAudio ? questionAudio.toString("base64") : null,
      interviewState,
      transcript,
      done: false,
    });
  } catch (err) {
    console.error("[/api/interview/respond]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
