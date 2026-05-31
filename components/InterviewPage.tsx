"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PersonaSpectrum from "@/components/PersonaSpectrum";
import ShareableAvatarCard from "@/components/ShareableAvatarCard";
import { computePersona, type Persona as HmtiPersona } from "@/lib/business-logic";
import { DEFAULT_USER_ID, DEBUG_AGENTS } from "@/lib/config";

type Message = { speaker: "ai" | "user"; text: string; domain?: string };

type StartResponse = {
  intro: string;
  question: string;
  domain?: string;
  audio: string | null;
  done: boolean;
};

type AgentPersona = { type: string; weight: number; rationale: string };

type RespondResponse = {
  comment?: string;
  question?: string;
  domain?: string;
  userTranscript?: string;
  audio?: string | null;
  done: boolean;
  transcript?: Message[];
  personas?: AgentPersona[];
};

export default function InterviewPage() {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [status, setStatus] = useState("Waiting for question…");
  const [canRecord, setCanRecord] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [personas, setPersonas] = useState<AgentPersona[]>([]);
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [textInput, setTextInput] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, done]);

  function addMessage(speaker: "ai" | "user", text: string, domain?: string) {
    setTranscript((prev) => [...prev, { speaker, text, ...(domain && { domain }) }]);
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
    const uid = userId.trim() || crypto.randomUUID();
    if (uid !== userId) setUserId(uid);

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
        body: JSON.stringify({ userId: uid, tts: ttsEnabled }),
      });

      if (data.intro) addMessage("ai", data.intro);
      addMessage("ai", data.question, data.domain);
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
      if (data.personas) setPersonas(data.personas);
      setDone(true);
      setStatus("Interview complete! Thanks.");
    } else {
      if (data.comment) addMessage("ai", data.comment);
      if (data.question) addMessage("ai", data.question, data.domain);
      if (data.audio) {
        setStatus("Speaking question…");
        await playBase64Audio(data.audio);
      }
      setCanRecord(true);
      setStatus("Hold the button or type your answer");
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
    formData.append("tts", String(ttsEnabled));

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
        body: JSON.stringify({ userId, text, tts: ttsEnabled }),
      });
      await afterRespond(data);
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
      setCanRecord(true);
    }
  }

  const domainColors: Record<string, { border: string; badge: string; label: string }> = {
    communication: {
      border: "border-blue-400",
      badge: "bg-blue-100 text-blue-700",
      label: "Communication",
    },
    cleanliness: {
      border: "border-green-400",
      badge: "bg-green-100 text-green-700",
      label: "Cleanliness",
    },
    social: {
      border: "border-purple-400",
      badge: "bg-purple-100 text-purple-700",
      label: "Social",
    },
    personal_space: {
      border: "border-orange-400",
      badge: "bg-orange-100 text-orange-700",
      label: "Personal Space",
    },
  };

  const recordDisabled = done || !canRecord;

  const hmtiPersona: HmtiPersona | null = useMemo(() => {
    if (!done) return null;
    const userText = transcript
      .filter((m) => m.speaker === "user")
      .map((m) => m.text)
      .join("\n");
    return computePersona(userText || userId);
  }, [done, transcript, userId]);

  return (
    <main className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="w-16" />
        <h1 className="text-xl font-semibold text-slate-900">RoomieScout</h1>
        <button
          onClick={() => {
            if (
              !ttsEnabled &&
              !window.confirm(
                "This uses ElevenLabs credits. Only turn on with intention — turn off when done testing.",
              )
            ) {
              return;
            }
            setTtsEnabled((v) => !v);
          }}
          title={ttsEnabled ? "Voice on — click to mute" : "Voice off (saves API credits)"}
          className={[
            "w-16 text-right text-xl transition-opacity",
            ttsEnabled ? "opacity-100" : "opacity-30",
          ].join(" ")}
        >
          {ttsEnabled ? "🔊" : "🔇"}
        </button>
      </header>

      {!started && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <button
            onClick={handleStart}
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Start talking with Scout
          </button>
        </div>
      )}

      {started && (
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
          <div className="mx-auto max-w-xl space-y-3">
            {transcript.map((msg, i) => {
              const agentStyle = DEBUG_AGENTS && msg.domain ? domainColors[msg.domain] : null;

              return (
                <div
                  key={i}
                  className={`flex flex-col ${msg.speaker === "ai" ? "items-start" : "items-end"}`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {msg.speaker === "ai" ? "Scout" : "You"}
                    </span>
                    {agentStyle && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${agentStyle.badge}`}
                      >
                        {agentStyle.label}
                      </span>
                    )}
                  </div>
                  <div
                    className={[
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.speaker === "ai"
                        ? `rounded-bl-sm bg-white text-slate-800 border-2 ${agentStyle ? agentStyle.border : "border-slate-200"}`
                        : "rounded-br-sm bg-slate-900 text-white",
                    ].join(" ")}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {done && personas.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 text-center text-lg font-semibold text-slate-900">
                  Your Roommate Persona
                </h2>
                <div className="space-y-3">
                  {personas.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{p.type}</span>
                        <span className="text-sm font-bold text-slate-700">{p.weight}%</span>
                      </div>
                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all duration-500"
                          style={{ width: `${p.weight}%` }}
                        />
                      </div>
                      <p className="text-xs leading-relaxed text-slate-500">{p.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {done && hmtiPersona ? (
              <div className="mt-10 space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-slate-900">Your Housemate Type</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Share your card — then invite a roommate to compare types.
                  </p>
                </div>
                <ShareableAvatarCard persona={hmtiPersona} />
                <details className="rounded-xl border border-slate-200 bg-white">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
                    See full HMTI breakdown
                  </summary>
                  <div className="border-t border-slate-100 p-2">
                    <PersonaSpectrum persona={hmtiPersona} />
                  </div>
                </details>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {started && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-4 py-3 shadow-md">
          <div className="mx-auto flex max-w-xl items-center gap-2">
            <input
              className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:opacity-40"
              placeholder="Or type your answer…"
              value={textInput}
              disabled={done}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            />
            <button
              onClick={handleTextSubmit}
              disabled={recordDisabled || !textInput.trim() || recording}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
            >
              Send
            </button>
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
                "flex shrink-0 items-center justify-center rounded-full text-xl transition-colors",
                transcribing
                  ? "animate-pulse cursor-not-allowed bg-amber-400 text-white"
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
          <p className="mt-1.5 text-center text-xs text-slate-400">{status}</p>
        </div>
      )}

      <audio ref={playerRef} className="hidden" />
    </main>
  );
}
