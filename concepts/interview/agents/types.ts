export type AgentDomain =
  | "communication"
  | "cleanliness"
  | "social"
  | "personal_space"
  | "dealbreakers";

export const ALL_DOMAINS: AgentDomain[] = [
  "communication",
  "cleanliness",
  "social",
  "personal_space",
  "dealbreakers",
];

export type AgentState = {
  domain: AgentDomain;
  satisfied: boolean;
  questionsAsked: number;
  clarificationsAsked: number;
};

export type SpecialistResponse = {
  question: string;
  satisfied: boolean;
  clarification_needed?: boolean;
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
