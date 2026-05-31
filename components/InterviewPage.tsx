"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_USER_ID, DEBUG_AGENTS } from "@/lib/config";

type Message = { speaker: "ai" | "user"; text: string; domain?: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InterviewState = any;

type StartResponse = {
  intro: string;
  question: string;
  domain?: string;
  audio: string | null;
  interviewState: InterviewState;
  transcript: Message[];
  flowId?: string | null;
  done: boolean;
};

type RespondResponse = {
  comment?: string;
  question?: string;
  domain?: string;
  userTranscript?: string;
  audio?: string | null;
  done: boolean;
  transcript?: Message[];
  interviewState?: InterviewState;
  redirectTo?: string;
};

export default function InterviewPage({ flowId }: { flowId?: string } = {}) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [status, setStatus] = useState("Waiting for question…");
  const [canRecord, setCanRecord] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [textInput, setTextInput] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [scoutThinking, setScoutThinking] = useState(false);
  const interviewStateRef = useRef<InterviewState>(null);
  const serverTranscriptRef = useRef<Message[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    handleStart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    setStarted(true);
    setStatus("Starting…");

    try {
      const data = await fetchJSON<StartResponse>("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tts: ttsEnabled, ...(flowId && { flowId }) }),
      });

      interviewStateRef.current = data.interviewState;
      serverTranscriptRef.current = data.transcript;
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
    setScoutThinking(false);
    if (data.interviewState) interviewStateRef.current = data.interviewState;
    if (data.transcript) serverTranscriptRef.current = data.transcript;
    if (data.userTranscript) addMessage("user", data.userTranscript);

    if (data.done) {
      if (data.comment) addMessage("ai", data.comment);
      if (data.question) addMessage("ai", data.question);
      if (data.audio) await playBase64Audio(data.audio);
      setDone(true);
      setStatus("Interview complete! Redirecting…");
      if (data.redirectTo) {
        setTimeout(() => router.push(data.redirectTo!), 2000);
      }
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
    if (!streamRef.current) {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        alert("Microphone access is required for voice input.");
        return;
      }
    }
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
    formData.append("audio", blob, "recording.webm");
    formData.append("tts", String(ttsEnabled));
    formData.append("interviewState", JSON.stringify(interviewStateRef.current));
    formData.append("transcript", JSON.stringify(serverTranscriptRef.current));
    if (flowId) formData.append("flowId", flowId);

    try {
      const data = await fetchJSON<RespondResponse>("/api/interview/respond", {
        method: "POST",
        body: formData,
      });
      setTranscribing(false);
      setScoutThinking(true);
      await afterRespond(data);
    } catch (err) {
      setTranscribing(false);
      setScoutThinking(false);
      setStatus(`Error: ${(err as Error).message}`);
      setCanRecord(true);
    }
  }

  async function handleTextSubmit() {
    const text = textInput.trim();
    if (!text || !canRecord) return;
    setTextInput("");
    setCanRecord(false);
    setScoutThinking(true);
    setStatus("Sending…");

    try {
      const data = await fetchJSON<RespondResponse>("/api/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          tts: ttsEnabled,
          interviewState: interviewStateRef.current,
          transcript: serverTranscriptRef.current,
          ...(flowId && { flowId }),
        }),
      });
      await afterRespond(data);
    } catch (err) {
      setScoutThinking(false);
      setStatus(`Error: ${(err as Error).message}`);
      setCanRecord(true);
    }
  }

  const domainColors: Record<string, { border: string; badge: string; label: string }> = {
    communication: { border: "border-blue-400", badge: "bg-blue-100 text-blue-700", label: "Communication" },
    cleanliness: { border: "border-green-400", badge: "bg-green-100 text-green-700", label: "Cleanliness" },
    social: { border: "border-purple-400", badge: "bg-purple-100 text-purple-700", label: "Social" },
    personal_space: { border: "border-orange-400", badge: "bg-orange-100 text-orange-700", label: "Personal Space" },
  };

  const recordDisabled = done || !canRecord;

  return (
    <main className="flex h-screen flex-col">
      <header className="shrink-0 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="w-16" />
        <h1 className="text-xl font-semibold text-slate-900">RoomieScout</h1>
        <button
          onClick={() => {
            if (!ttsEnabled && !window.confirm("This uses ElevenLabs credits. Only turn on with intention — turn off when done testing.")) return;
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

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        <div className="mx-auto max-w-xl space-y-3">
          {transcript.map((msg, i) => {
            const agentStyle = DEBUG_AGENTS && msg.domain ? domainColors[msg.domain] : null;

            return (
              <div key={i} className={`flex flex-col ${msg.speaker === "ai" ? "items-start" : "items-end"}`}>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {msg.speaker === "ai" ? "Scout" : "You"}
                  </span>
                  {agentStyle && (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${agentStyle.badge}`}>
                      {agentStyle.label}
                    </span>
                  )}
                </div>
                <div className={[
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.speaker === "ai"
                    ? `rounded-bl-sm bg-white text-slate-800 border-2 ${agentStyle ? agentStyle.border : "border-slate-200"}`
                    : "rounded-br-sm bg-slate-900 text-white",
                ].join(" ")}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {scoutThinking && (
            <div className="flex flex-col items-start">
              <span className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Scout</span>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

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
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-slate-700"
            >
              Send
            </button>
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
          <p className="mt-1.5 text-center text-xs text-slate-400">{status}</p>
        </div>

      <audio ref={playerRef} className="hidden" />
    </main>
  );
}
