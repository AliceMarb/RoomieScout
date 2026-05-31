"use client";

import { useState, useRef, useEffect } from "react";
import { DEFAULT_USER_ID } from "@/lib/config";

type Message = { speaker: "ai" | "user"; text: string };

type StartResponse = {
  intro: string;
  question: string;
  audio: string | null;
  done: boolean;
};

type RespondResponse = {
  comment?: string;      // optional reaction/statement before the question
  question?: string;     // the next question, always its own bubble
  userTranscript?: string;
  audio?: string | null; // audio covers comment + question spoken together
  done: boolean;
  transcript?: Message[];
};

export default function InterviewPage() {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [status, setStatus] = useState("Waiting for question…");
  const [canRecord, setCanRecord] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [textInput, setTextInput] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  function addMessage(speaker: "ai" | "user", text: string) {
    setTranscript((prev) => [...prev, { speaker, text }]);
  }

  function playBase64Audio(b64: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = playerRef.current!;
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(new Error(`Audio playback failed: ${String(e)}`));
      audio.src = `data:audio/mpeg;base64,${b64}`;
      audio.play().catch(reject);
    });
  }

  async function fetchJSON<T>(url: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async function handleStart() {
    if (!userId.trim()) { alert("Enter a name or ID first"); return; }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      alert("Microphone access is required.");
      return;
    }

    setStarted(true);
    setStatus("Starting…");

    try {
      const data = await fetchJSON<StartResponse>("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (data.intro) addMessage("ai", data.intro);
      addMessage("ai", data.question);
      if (data.audio) {
        setStatus("Speaking question…");
        await playBase64Audio(data.audio);
      }
      setCanRecord(true);
      setStatus("Hold the button or type your answer");
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    }
  }

  async function afterRespond(data: RespondResponse) {
    if (data.userTranscript) addMessage("user", data.userTranscript);

    if (data.done) {
      if (data.comment) addMessage("ai", data.comment);
      if (data.question) addMessage("ai", data.question);
      if (data.audio) await playBase64Audio(data.audio);
      setDone(true);
      setStatus("Interview complete! Thanks.");
    } else {
      // Comment and question are always separate bubbles
      if (data.comment) addMessage("ai", data.comment);
      if (data.question) addMessage("ai", data.question);
      if (data.audio) {
        setStatus("Speaking question…");
        await playBase64Audio(data.audio);
      }
      setCanRecord(true);
      setStatus("Hold the button or type your answer");
    }
  }

  // ── Voice input ───────────────────────────────────────────────────────────

  async function handleRecordStart() {
    audioChunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current!);
    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
    setStatus("Recording… release to submit");
  }

  async function handleRecordStop() {
    setRecording(false);
    setCanRecord(false);
    setTranscribing(true);
    setStatus("Transcribing…");

    await new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = () => resolve();
      mediaRecorderRef.current!.stop();
    });

    const mimeType = mediaRecorderRef.current!.mimeType || "audio/webm";
    const blob = new Blob(audioChunksRef.current, { type: mimeType });
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("audio", blob, "recording.webm");

    try {
      const data = await fetchJSON<RespondResponse>("/api/interview/respond", {
        method: "POST",
        body: formData,
      });
      setTranscribing(false);
      await afterRespond(data);
    } catch (err) {
      setTranscribing(false);
      setStatus(`Error: ${(err as Error).message}`);
      setCanRecord(true);
    }
  }

  // ── Text input ────────────────────────────────────────────────────────────

  async function handleTextSubmit() {
    const text = textInput.trim();
    if (!text || !canRecord) return;
    setTextInput("");
    setCanRecord(false);
    setStatus("Sending…");

    try {
      const data = await fetchJSON<RespondResponse>("/api/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text }),
      });
      await afterRespond(data);
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
      setCanRecord(true);
    }
  }

  const recordDisabled = done || !canRecord;

  return (
    <main className="flex h-screen flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-100 px-4 py-4 text-center">
        <h1 className="text-xl font-semibold text-slate-900">RoomieScout</h1>
      </header>

      {/* Name input — only before interview starts */}
      {!started && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          {!DEFAULT_USER_ID && (
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              placeholder="Your name or ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
          )}
          <button
            onClick={handleStart}
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Start interview
          </button>
        </div>
      )}

      {/* Scrollable transcript */}
      {started && (
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
          <div className="mx-auto max-w-xl space-y-3">
            {transcript.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.speaker === "ai" ? "items-start" : "items-end"}`}>
                <span className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {msg.speaker === "ai" ? "Scout" : "You"}
                </span>
                <div className={[
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.speaker === "ai"
                    ? "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                    : "rounded-br-sm bg-slate-900 text-white",
                ].join(" ")}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Pinned input bar */}
      {started && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-4 py-3 shadow-md">
          <div className="mx-auto flex max-w-xl items-center gap-2">
            {/* Text input */}
            <input
              className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:opacity-40"
              placeholder="Or type your answer…"
              value={textInput}
              disabled={done}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            />

            {/* Send button */}
            <button
              onClick={handleTextSubmit}
              disabled={recordDisabled || !textInput.trim() || recording}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-slate-700"
            >
              Send
            </button>

            {/* Mic button */}
            <button
              disabled={recordDisabled}
              onMouseDown={handleRecordStart}
              onMouseUp={handleRecordStop}
              onTouchStart={(e) => { e.preventDefault(); handleRecordStart(); }}
              onTouchEnd={(e) => { e.preventDefault(); handleRecordStop(); }}
              className={[
                "flex shrink-0 items-center justify-center rounded-full text-xl transition-colors",
                transcribing
                  ? "cursor-not-allowed bg-amber-400 text-white animate-pulse"
                  : recordDisabled
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : recording
                  ? "cursor-pointer bg-red-500 text-white ring-4 ring-red-200"
                  : "cursor-pointer bg-slate-900 text-white hover:bg-slate-700",
              ].join(" ")}
              style={{ width: 44, height: 44 }}
              title="Hold to speak"
            >
              {done ? "✓" : transcribing ? "⏳" : "🎙"}
            </button>
          </div>

          {/* Status line */}
          <p className="mt-1.5 text-center text-xs text-slate-400">{status}</p>
        </div>
      )}

      <audio ref={playerRef} className="hidden" />
    </main>
  );
}
