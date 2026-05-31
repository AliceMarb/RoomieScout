"use client";

import { useState, useRef } from "react";
import { DEFAULT_USER_ID } from "@/lib/config";

type Message = { speaker: "ai" | "user"; text: string };

type StartResponse = {
  intro: string;
  question: string;
  audio: string | null;
  done: boolean;
};

type RespondResponse = {
  question?: string;
  userTranscript?: string;
  audio?: string;
  done: boolean;
};

export default function InterviewPage() {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Waiting for question…");
  const [canRecord, setCanRecord] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [userId, setUserId] = useState(DEFAULT_USER_ID);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);

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
    if (!userId.trim()) {
      alert("Enter a name or ID first");
      return;
    }

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
      setStatus("Hold the button and speak your answer");
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    }
  }

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

    let data: RespondResponse;
    try {
      data = await fetchJSON<RespondResponse>("/api/interview/respond", {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
      setCanRecord(true);
      return;
    }

    if (data.userTranscript) addMessage("user", data.userTranscript);

    if (data.done) {
      setDone(true);
      setStatus("Interview complete! Thanks.");
    } else {
      addMessage("ai", data.question!);
      if (data.audio) {
        setStatus("Speaking question…");
        await playBase64Audio(data.audio);
      }
      setCanRecord(true);
      setStatus("Hold the button and speak your answer");
    }
  }

  const recordDisabled = done || !canRecord;

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">RoomieScout</h1>
        <p className="mt-1 text-sm text-slate-500">
          Answer each question out loud. Hold the button while speaking.
        </p>
      </header>

      {/* Name / ID input — hidden when DEFAULT_USER_ID is set */}
      {!started && (
        <div className="mb-8 flex items-center gap-3">
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
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Start
          </button>
        </div>
      )}

      {/* Record button */}
      {started && (
        <div className="mb-8 flex flex-col items-center gap-3">
          <button
            disabled={recordDisabled}
            onMouseDown={handleRecordStart}
            onMouseUp={handleRecordStop}
            onTouchStart={(e) => {
              e.preventDefault();
              handleRecordStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleRecordStop();
            }}
            className={[
              "flex h-18 w-18 items-center justify-center rounded-full text-2xl transition-colors",
              recordDisabled
                ? "cursor-not-allowed bg-slate-300 text-white"
                : recording
                ? "cursor-pointer bg-red-500 text-white ring-4 ring-red-300"
                : "cursor-pointer bg-slate-900 text-white hover:bg-slate-700",
            ].join(" ")}
            style={{ width: 72, height: 72 }}
          >
            {done ? "✓" : "🎙"}
          </button>
          <span className="text-xs text-slate-500">{status}</span>
        </div>
      )}

      {/* Transcript */}
      <div className="w-full max-w-xl space-y-3">
        {transcript.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.speaker === "ai" ? "items-start" : "items-end"
            }`}
          >
            <span className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {msg.speaker === "ai" ? "Scout" : "You"}
            </span>
            <div
              className={[
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.speaker === "ai"
                  ? "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                  : "rounded-br-sm bg-slate-900 text-white",
              ].join(" ")}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <audio ref={playerRef} className="hidden" />
    </main>
  );
}
