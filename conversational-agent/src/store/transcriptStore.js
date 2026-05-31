// Attach to globalThis so Next.js hot-module-reload doesn't wipe the Map between requests
if (!globalThis._roomieScoutSessions) globalThis._roomieScoutSessions = new Map();
const sessions = globalThis._roomieScoutSessions;

function getSession(userId) {
  return sessions.get(userId) || null;
}

function createSession(userId) {
  const session = { transcript: [], currentQuestionIndex: 0 };
  sessions.set(userId, session);
  return session;
}

function appendMessage(userId, speaker, text) {
  const session = sessions.get(userId);
  if (!session) throw new Error(`No session for userId: ${userId}`);
  session.transcript.push({ speaker, text });
}

function advanceQuestion(userId) {
  const session = sessions.get(userId);
  if (!session) throw new Error(`No session for userId: ${userId}`);
  session.currentQuestionIndex += 1;
}

function deleteSession(userId) {
  sessions.delete(userId);
}

function getAllTranscripts() {
  const result = {};
  for (const [userId, session] of sessions.entries()) {
    result[userId] = session.transcript;
  }
  return result;
}

export { getSession, createSession, appendMessage, advanceQuestion, deleteSession, getAllTranscripts };
