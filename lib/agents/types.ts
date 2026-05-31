export type AgentDomain =
  | "communication"
  | "cleanliness"
  | "social"
  | "personal_space";

export const ALL_DOMAINS: AgentDomain[] = [
  "communication",
  "cleanliness",
  "social",
  "personal_space",
];

export type AgentState = {
  domain: AgentDomain;
  satisfied: boolean;
  questionsAsked: number;
};

export type SpecialistResponse = {
  question: string;
  satisfied: boolean;
};

export type OrchestratorDecision =
  | { done: false; domain: AgentDomain }
  | { done: true };

export type InterviewState = {
  agentStates: Record<AgentDomain, AgentState>;
  turnCount: number;
  currentAgentDomain: AgentDomain | null;
  isComplete: boolean;
};
