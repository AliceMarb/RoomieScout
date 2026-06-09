import { NextResponse } from "next/server";
import { SCOUT_CLOSING } from "@/lib/interview";
import { speechToText, textToSpeech } from "@/lib/voice";
import { getNextQuestion, classifyPersona } from "@/lib/agents";
import { createFlowFromInterview, getFlow, updateFlow } from "@/lib/store";
import { computeCompatibility } from "@/lib/business-logic";
import { formatTranscript } from "@/lib/agents/format";
import type { InterviewState } from "@/lib/agents";
import type { Message } from "@/lib/transcriptStore";

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

    transcript.push({ speaker: "user", text: userText });

    const result = await getNextQuestion(transcript, interviewState);

    if ("done" in result) {
      transcript.push({ speaker: "ai", text: SCOUT_CLOSING });

      const [closingAudio, persona] = await Promise.all([
        tts ? textToSpeech(SCOUT_CLOSING) : Promise.resolve(null),
        classifyPersona(transcript),
      ]);

      const transcriptText = formatTranscript(transcript);
      let redirectTo: string;

      if (flowId) {
        const flow = await getFlow(flowId);
        if (flow) {
          const compat = computeCompatibility(flow.initiatorPersona, persona);
          await updateFlow(flowId, {
            roommateInput: transcriptText,
            roommatePersona: persona,
            result: compat,
            resultsReadyAt: Date.now() + 2500,
          });
        }
        redirectTo = `/results/${flowId}`;
      } else {
        const flow = await createFlowFromInterview(transcriptText, persona);
        redirectTo = `/share/${flow.id}`;
      }

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
