export type Speaker = "ai" | "user";

export type Message = {
  speaker: Speaker;
  text: string;
};

export type Session = {
  transcript: Message[];
  currentQuestionIndex: number;
};

// Attach to globalThis so Next.js hot-module-reload doesn't wipe the Map between requests
declare global { var _roomieScoutSessions: Map<string, Session> | undefined; }
if (!globalThis._roomieScoutSessions) globalThis._roomieScoutSessions = new Map();
const sessions = globalThis._roomieScoutSessions;

export function getSession(userId: string): Session | null {
  return sessions.get(userId) ?? null;
}

export function createSession(userId: string): Session {
  const session: Session = { transcript: [], currentQuestionIndex: 0 };
  sessions.set(userId, session);
  return session;
}

export function appendMessage(userId: string, speaker: Speaker, text: string): void {
  const session = sessions.get(userId);
  if (!session) throw new Error(`No session for userId: ${userId}`);
  session.transcript.push({ speaker, text });
}

export function advanceQuestion(userId: string): void {
  const session = sessions.get(userId);
  if (!session) throw new Error(`No session for userId: ${userId}`);
  session.currentQuestionIndex += 1;
}

export function deleteSession(userId: string): void {
  sessions.delete(userId);
}

export function getAllTranscripts(): Record<string, Message[]> {
  const result: Record<string, Message[]> = {};
  for (const [userId, session] of sessions.entries()) {
    result[userId] = session.transcript;
  }
  return result;
}
