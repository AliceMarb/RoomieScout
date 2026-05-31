import { getOpenAI, MODEL } from "@/lib/openai";
import { ORCHESTRATOR_PROMPT } from "./prompts";
import { getSpecialistQuestion } from "./specialist";
import type { AgentDomain, InterviewState, OrchestratorDecision } from "./types";
import { ALL_DOMAINS as DOMAINS } from "./types";
import type { Message } from "@/lib/transcriptStore";

const MAX_TURNS = 12;
const MAX_QUESTIONS_PER_AGENT = 4;

function formatTranscript(transcript: Message[]): string {
  return transcript
    .map((m) => `${m.speaker === "ai" ? "Scout" : "User"}: ${m.text}`)
    .join("\n");
}

export function createInitialInterviewState(): InterviewState {
  const agentStates = {} as InterviewState["agentStates"];
  for (const domain of DOMAINS) {
    agentStates[domain] = {
      domain,
      satisfied: false,
      questionsAsked: 0,
    };
  }
  return {
    agentStates,
    turnCount: 0,
    currentAgentDomain: null,
    isComplete: false,
  };
}

function allSatisfied(state: InterviewState): boolean {
  return DOMAINS.every((d) => state.agentStates[d].satisfied);
}

async function pickDomain(
  transcript: Message[],
  state: InterviewState,
): Promise<OrchestratorDecision> {
  const stateDescription = DOMAINS.map((d) => {
    const s = state.agentStates[d];
    return `- ${d}: ${s.questionsAsked} questions asked, ${s.satisfied ? "SATISFIED" : "needs more info"}`;
  }).join("\n");

  const userMessage = `CONVERSATION SO FAR:
${transcript.length > 0 ? formatTranscript(transcript) : "(No conversation yet — this is the first turn.)"}

AGENT STATES:
${stateDescription}

LAST DOMAIN USED: ${state.currentAgentDomain ?? "none (first turn)"}
TOTAL TURNS SO FAR: ${state.turnCount}

Pick the next domain or end the interview.`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ORCHESTRATOR_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from orchestrator");

    const parsed = JSON.parse(raw) as OrchestratorDecision;

    if (parsed.done) {
      return { done: true };
    }

    if (!("domain" in parsed) || !DOMAINS.includes(parsed.domain)) {
      throw new Error(`Invalid domain: ${JSON.stringify(parsed)}`);
    }

    if (state.agentStates[parsed.domain].satisfied) {
      const unsatisfied = DOMAINS.filter((d) => !state.agentStates[d].satisfied);
      if (unsatisfied.length === 0) return { done: true };
      return { done: false, domain: unsatisfied[0] };
    }

    return { done: false, domain: parsed.domain };
  } catch (err) {
    console.error("[orchestrator]", err);
    const unsatisfied = DOMAINS.filter((d) => !state.agentStates[d].satisfied);
    if (unsatisfied.length === 0) return { done: true };
    return { done: false, domain: unsatisfied[0] };
  }
}

export async function getNextQuestion(
  transcript: Message[],
  state: InterviewState,
): Promise<{ question: string; domain: AgentDomain } | { done: true }> {
  if (allSatisfied(state) || state.turnCount >= MAX_TURNS) {
    state.isComplete = true;
    return { done: true };
  }

  const decision = await pickDomain(transcript, state);

  if (decision.done) {
    state.isComplete = true;
    return { done: true };
  }

  const domain = decision.domain;
  const agentState = state.agentStates[domain];

  const response = await getSpecialistQuestion(domain, transcript, agentState);

  agentState.questionsAsked += 1;

  if (response.satisfied || agentState.questionsAsked >= MAX_QUESTIONS_PER_AGENT) {
    agentState.satisfied = true;
  }

  state.turnCount += 1;
  state.currentAgentDomain = domain;

  if (agentState.satisfied && !response.question) {
    if (allSatisfied(state)) {
      state.isComplete = true;
      return { done: true };
    }
    return getNextQuestion(transcript, state);
  }

  return { question: response.question, domain };
}
