// Interview concept — conducts a structured voice conversation and produces a transcript.
// Import everything interview-related from here.

export { SCOUT_INTRO, SCOUT_INTRO_SPOKEN, SCOUT_CLOSING } from "./copy";

export type { Speaker, Message, Session } from "./session";
export {
  getSession,
  createSession,
  appendMessage,
  advanceQuestion,
  deleteSession,
  getAllTranscripts,
} from "./session";

export {
  getNextQuestion,
  createInitialInterviewState,
  classifyPersona,
  formatTranscript,
  ALL_DOMAINS,
} from "./agents";
export type { AgentDomain, AgentState, InterviewState, SpecialistResponse, OrchestratorDecision } from "./agents";
