"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEBUG_AGENTS } from "@/lib/config";
import { Wordmark, cn } from "@/components/ui";

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

type OrbState = "idle" | "speaking" | "listening" | "transcribing" | "thinking" | "done";

export default function InterviewPage({ flowId }: { flowId?: string } = {}) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [canRecord, setCanRecord] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [scoutThinking, setScoutThinking] = useState(false);
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [speaking, setSpeaking] = useState(false);
  const [lastAiMessage, setLastAiMessage] = useState("");
  const interviewStateRef = useRef<InterviewState>(null);
  const serverTranscriptRef = useRef<Message[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, done, scoutThinking]);

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    handleStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orbState: OrbState =
    done ? "done" :
    recording ? "listening" :
    transcribing ? "transcribing" :
    scoutThinking ? "thinking" :
    speaking ? "speaking" :
    "idle";

  const turnCount = transcript.filter((m) => m.speaker === "user").length;

  function addMessage(speaker: "ai" | "user", text: string, domain?: string) {
    setTranscript((prev) => [...prev, { speaker, text, ...(domain && { domain }) }]);
    if (speaker === "ai") setLastAiMessage(text);
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

  async function playAudioWithState(b64: string) {
    setSpeaking(true);
    try {
      await playBase64Audio(b64);
    } finally {
      setSpeaking(false);
    }
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
    setStarted(true);

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
        await playAudioWithState(data.audio);
      }
      setCanRecord(true);
    } catch (err) {
      setLastAiMessage(`Error: ${(err as Error).message}`);
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
      if (data.audio) await playAudioWithState(data.audio);
      setDone(true);
      if (data.redirectTo) {
        setTimeout(() => router.push(data.redirectTo!), 2000);
      }
    } else {
      if (data.comment) addMessage("ai", data.comment);
      if (data.question) addMessage("ai", data.question, data.domain);
      if (data.audio) {
        await playAudioWithState(data.audio);
      }
      setCanRecord(true);
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
  }

  async function handleRecordStop() {
    setRecording(false);
    setCanRecord(false);
    setTranscribing(true);

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
      setLastAiMessage(`Error: ${(err as Error).message}`);
      setCanRecord(true);
    }
  }

  async function handleTextSubmit() {
    const text = textInput.trim();
    if (!text || !canRecord) return;
    setTextInput("");
    setCanRecord(false);
    setScoutThinking(true);

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
      setLastAiMessage(`Error: ${(err as Error).message}`);
      setCanRecord(true);
    }
  }

  function handleModeToggle() {
    if (mode === "text") {
      setMode("voice");
      setTtsEnabled(true);
    } else {
      setMode("text");
    }
  }

  const domainColors: Record<string, { border: string; badge: string; label: string }> = {
    communication: { border: "border-blue-400", badge: "bg-blue-100 text-blue-700", label: "Communication" },
    cleanliness: { border: "border-green-400", badge: "bg-green-100 text-green-700", label: "Cleanliness" },
    social: { border: "border-purple-400", badge: "bg-purple-100 text-purple-700", label: "Social" },
    personal_space: { border: "border-orange-400", badge: "bg-orange-100 text-orange-700", label: "Personal Space" },
  };

  const recordDisabled = done || !canRecord;

  const statusText: Record<OrbState, string> = {
    idle: canRecord ? "Hold to talk" : "Starting...",
    speaking: "Scout is speaking",
    listening: "Listening...",
    transcribing: "Transcribing...",
    thinking: "Scout is thinking...",
    done: "All done. Redirecting...",
  };

  // ── Voice mode ──────────────────────────────────────────────

  if (mode === "voice") {
    return (
      <main className="flex h-dvh flex-col bg-paper bg-grid">
        <header className="shrink-0 px-5 pt-6 pb-2 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">RoomieScout</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-snug text-ink-soft">
            A quick voice chat to find your perfect roommate match. Just be yourself.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (!ttsEnabled && !window.confirm("This uses ElevenLabs credits. Only turn on with intention — turn off when done testing.")) return;
                setTtsEnabled((v) => !v);
              }}
              title={ttsEnabled ? "Voice on — click to mute" : "Voice off (saves API credits)"}
              className={cn(
                "text-lg transition-opacity",
                ttsEnabled ? "opacity-100" : "opacity-30",
              )}
            >
              {ttsEnabled ? "\u{1F50A}" : "\u{1F507}"}
            </button>
            <button
              onClick={handleModeToggle}
              className="eyebrow rounded-md px-2.5 py-1.5 transition-colors hover:bg-ink/5"
            >
              Chat
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6">
          {/* Current question */}
          <div className="mb-10 min-h-[2rem] max-w-sm text-center">
            {lastAiMessage && (
              <p className="text-sm font-medium leading-relaxed text-ink transition-opacity duration-500">
                {lastAiMessage}
              </p>
            )}
          </div>

          {/* The orb */}
          <div className="relative flex items-center justify-center">
            {(orbState === "speaking" || orbState === "listening") && (
              <span
                className="absolute rounded-full bg-accent/30"
                style={{
                  width: "100%",
                  height: "100%",
                  animation: "orb-ring 1.5s ease-out infinite",
                }}
              />
            )}
            <button
              className={cn(
                "relative flex h-40 w-40 items-center justify-center rounded-full transition-all duration-300 sm:h-48 sm:w-48",
                orbState === "idle" && canRecord && "bg-accent cursor-pointer shadow-lg hover:shadow-xl active:scale-95",
                orbState === "idle" && !canRecord && "bg-accent/40 cursor-not-allowed",
                orbState === "speaking" && "bg-accent cursor-default",
                orbState === "listening" && "bg-ink cursor-pointer ring-4 ring-accent/40",
                orbState === "transcribing" && "bg-accent/60 animate-pulse cursor-not-allowed",
                orbState === "thinking" && "bg-accent/60 cursor-not-allowed",
                orbState === "done" && "bg-accent cursor-default",
              )}
              style={{
                ...(orbState === "speaking" ? { animation: "orb-pulse 2s ease-in-out infinite" } : {}),
                ...(orbState === "listening" ? { animation: "orb-glow 1.5s ease-in-out infinite" } : {}),
                touchAction: "none",
              }}
              disabled={orbState === "done"}
              onMouseDown={() => {
                if (canRecord && orbState === "idle") handleRecordStart();
              }}
              onMouseUp={() => {
                if (recording) handleRecordStop();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (canRecord && orbState === "idle") handleRecordStart();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                if (recording) handleRecordStop();
              }}
              aria-label={statusText[orbState]}
            >
              {orbState === "thinking" ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-paper/80 [animation-delay:-0.3s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-paper/80 [animation-delay:-0.15s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-paper/80" />
                </div>
              ) : orbState === "done" ? (
                <span className="font-display text-5xl font-bold text-paper/90">{"✓"}</span>
              ) : orbState === "listening" ? (
                <span className="font-display text-5xl font-bold text-paper/90">U</span>
              ) : (
                <span className="font-display text-5xl font-bold text-paper/90">S</span>
              )}
            </button>
          </div>

          {/* Status + progress */}
          <div className="mt-8 text-center">
            <p className="eyebrow" aria-live="polite">{statusText[orbState]}</p>
            {turnCount > 0 && !done && (
              <p className="eyebrow mt-2 text-ink-faint/60">Turn {turnCount}</p>
            )}
          </div>
        </div>

        <audio ref={playerRef} className="hidden" />
      </main>
    );
  }

  // ── Text mode ───────────────────────────────────────────────

  return (
    <main className="flex h-dvh flex-col bg-paper">
      <header className="shrink-0 border-b border-line px-5 py-3 flex items-center justify-between">
        <Wordmark />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!ttsEnabled && !window.confirm("This uses ElevenLabs credits. Only turn on with intention — turn off when done testing.")) return;
              setTtsEnabled((v) => !v);
            }}
            title={ttsEnabled ? "Voice on — click to mute" : "Voice off (saves API credits)"}
            className={cn(
              "text-lg transition-opacity",
              ttsEnabled ? "opacity-100" : "opacity-30",
            )}
          >
            {ttsEnabled ? "\u{1F50A}" : "\u{1F507}"}
          </button>
          <button
            onClick={handleModeToggle}
            className="eyebrow rounded-md px-2.5 py-1.5 transition-colors hover:bg-ink/5"
          >
            Voice
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        <div className="mx-auto max-w-xl space-y-3">
          {transcript.map((msg, i) => {
            const agentStyle = DEBUG_AGENTS && msg.domain ? domainColors[msg.domain] : null;

            return (
              <div key={i} className={`flex flex-col ${msg.speaker === "ai" ? "items-start" : "items-end"}`}>
                <div className="mb-1 flex items-center gap-2">
                  <span className="eyebrow">
                    {msg.speaker === "ai" ? "Scout" : "You"}
                  </span>
                  {agentStyle && (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${agentStyle.badge}`}>
                      {agentStyle.label}
                    </span>
                  )}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.speaker === "ai"
                    ? `rounded-bl-sm bg-surface text-ink border-2 ${agentStyle ? agentStyle.border : "border-line"}`
                    : "rounded-br-sm bg-ink text-paper",
                )}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {scoutThinking && (
            <div className="flex flex-col items-start">
              <span className="eyebrow mb-1">Scout</span>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-line bg-surface px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <input
            className="flex-1 rounded-full border border-line px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-40"
            placeholder="Type your answer..."
            value={textInput}
            disabled={done}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
          />
          <button
            onClick={handleTextSubmit}
            disabled={recordDisabled || !textInput.trim() || recording}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors disabled:opacity-40 hover:bg-ink/90"
          >
            Send
          </button>
          <button
            disabled={recordDisabled}
            onMouseDown={handleRecordStart}
            onMouseUp={handleRecordStop}
            onTouchStart={(e) => { e.preventDefault(); handleRecordStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); handleRecordStop(); }}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full text-xl transition-colors",
              transcribing && "cursor-not-allowed bg-accent text-paper animate-pulse",
              !transcribing && recordDisabled && "cursor-not-allowed bg-line text-ink-faint",
              !transcribing && !recordDisabled && recording && "cursor-pointer bg-accent-ink text-paper ring-4 ring-accent/30",
              !transcribing && !recordDisabled && !recording && "cursor-pointer bg-ink text-paper hover:bg-ink/90",
            )}
            style={{ width: 44, height: 44 }}
            title="Hold to speak"
          >
            {done ? "✓" : transcribing ? "⌛" : "\u{1F399}"}
          </button>
        </div>
        <p className="mt-1.5 text-center eyebrow">{statusText[orbState]}</p>
      </div>

      <audio ref={playerRef} className="hidden" />
    </main>
  );
}
