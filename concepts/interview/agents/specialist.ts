import { getOpenAIAsync, MODEL } from "@/infrastructure/openai";
import { getSpecialistPrompt } from "./prompts";
import { formatTranscript } from "./format";
import type { AgentDomain, AgentState, SpecialistResponse } from "./types";
import type { Message } from "../session";
import { weave } from "@/infrastructure/weave";

export const getSpecialistQuestion = weave.op(async function getSpecialistQuestion(
  domain: AgentDomain,
  transcript: Message[],
  agentState: AgentState,
): Promise<SpecialistResponse> {
  const systemPrompt = getSpecialistPrompt(domain);

  const userMessage = `CONVERSATION SO FAR:
${transcript.length > 0 ? formatTranscript(transcript) : "(No conversation yet — this is the opening question.)"}

YOUR STATE:
- Domain: ${domain}
- Questions you've asked so far: ${agentState.questionsAsked}

Generate your next question or signal satisfaction.`;

  try {
    const completion = await (await getOpenAIAsync()).chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from specialist");

    const parsed = JSON.parse(raw) as SpecialistResponse;

    if (typeof parsed.satisfied !== "boolean") {
      throw new Error("Missing satisfied field");
    }

    if (!parsed.satisfied && (!parsed.question || parsed.question.trim() === "")) {
      throw new Error("Not satisfied but no question provided");
    }

    return {
      question: parsed.question ?? "",
      satisfied: parsed.satisfied,
      clarification_needed: parsed.clarification_needed ?? false,
    };
  } catch (err) {
    console.error(`[specialist:${domain}]`, err);
    return {
      question: "Tell me a bit more about that — what does that actually look like day-to-day?",
      satisfied: false,
    };
  }
});
