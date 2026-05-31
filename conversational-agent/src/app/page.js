"use client";

import { useState, useRef } from "react";

const styles = {
  page: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 16px", minHeight: "100vh" },
  h1: { fontSize: "1.4rem", fontWeight: 600, marginBottom: 8 },
  sub: { color: "#666", fontSize: "0.9rem", marginBottom: 32 },
  setup: { display: "flex", gap: 12, marginBottom: 32, alignItems: "center" },
  input: { padding: "8px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: "0.95rem", width: 200 },
  startBtn: { padding: "8px 18px", border: "none", borderRadius: 6, fontSize: "0.95rem", cursor: "pointer", background: "#111", color: "#fff" },
  startBtnDisabled: { padding: "8px 18px", border: "none", borderRadius: 6, fontSize: "0.95rem", cursor: "not-allowed", background: "#999", color: "#fff" },
  controls: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 32 },
  recordBtnIdle: { width: 72, height: 72, borderRadius: "50%", fontSize: "1.6rem", background: "#111", color: "#fff", border: "4px solid #333", cursor: "pointer" },
  recordBtnActive: { width: 72, height: 72, borderRadius: "50%", fontSize: "1.6rem", background: "#e53e3e", color: "#fff", border: "4px solid #c53030", cursor: "pointer" },
  recordBtnDisabled: { width: 72, height: 72, borderRadius: "50%", fontSize: "1.6rem", background: "#aaa", color: "#fff", border: "4px solid #aaa", cursor: "not-allowed" },
  status: { fontSize: "0.85rem", color: "#555" },
  transcript: { width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 },
  bubbleWrapAi: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
  bubbleWrapUser: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  label: { fontSize: "0.7rem", fontWeight: 600, marginBottom: 4, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.05em" },
  bubbleAi: { maxWidth: "80%", padding: "10px 14px", borderRadius: 14, borderBottomLeftRadius: 4, fontSize: "0.95rem", lineHeight: 1.5, background: "#fff", border: "1px solid #ddd" },
  bubbleUser: { maxWidth: "80%", padding: "10px 14px", borderRadius: 14, borderBottomRightRadius: 4, fontSize: "0.95rem", lineHeight: 1.5, background: "#111", color: "#fff" },
};

export default function InterviewPage() {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Waiting for question…");
  const [canRecord, setCanRecord] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [userId, setUserId] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const playerRef = useRef(null);

  function addMessage(speaker, text) {
    setTranscript((prev) => [...prev, { speaker, text }]);
  }

  function playBase64Audio(b64) {
    return new Promise((resolve, reject) => {
      const audio = playerRef.current;
      audio.onended = resolve;
      audio.onerror = (e) => reject(new Error(`Audio playback failed: ${e.message ?? e}`));
      audio.src = `data:audio/mpeg;base64,${b64}`;
      audio.play().catch(reject);
    });
  }

  async function fetchJSON(url, opts) {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }
    return res.json();
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
      const data = await fetchJSON("/api/interview/start", {
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
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleRecordStart() {
    audioChunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
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

    await new Promise((resolve) => {
      mediaRecorderRef.current.onstop = resolve;
      mediaRecorderRef.current.stop();
    });

    const mimeType = mediaRecorderRef.current.mimeType || "audio/webm";
    const blob = new Blob(audioChunksRef.current, { type: mimeType });

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("audio", blob, "recording.webm");

    let data;
    try {
      data = await fetchJSON("/api/interview/respond", { method: "POST", body: formData });
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      setCanRecord(true);
      return;
    }

    if (data.userTranscript) addMessage("user", data.userTranscript);

    if (data.done) {
      setDone(true);
      setStatus("Interview complete! Thanks.");
    } else {
      addMessage("ai", data.question);
      if (data.audio) {
        setStatus("Speaking question…");
        await playBase64Audio(data.audio);
      }
      setCanRecord(true);
      setStatus("Hold the button and speak your answer");
    }
  }

  const recordBtnStyle = done || !canRecord
    ? styles.recordBtnDisabled
    : recording
    ? styles.recordBtnActive
    : styles.recordBtnIdle;

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>RoomieScout Interview</h1>
      <p style={styles.sub}>Answer each question out loud. Hold the button while speaking.</p>

      {!started && (
        <div style={styles.setup}>
          <input
            style={styles.input}
            placeholder="Your name or ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button style={styles.startBtn} onClick={handleStart}>Start</button>
        </div>
      )}

      {started && (
        <div style={styles.controls}>
          <button
            style={recordBtnStyle}
            disabled={done || !canRecord}
            onMouseDown={handleRecordStart}
            onMouseUp={handleRecordStop}
            onTouchStart={(e) => { e.preventDefault(); handleRecordStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); handleRecordStop(); }}
          >
            {done ? "✓" : "🎙"}
          </button>
          <span style={styles.status}>{status}</span>
        </div>
      )}

      <div style={styles.transcript}>
        {transcript.map((msg, i) => (
          <div key={i} style={msg.speaker === "ai" ? styles.bubbleWrapAi : styles.bubbleWrapUser}>
            <div style={styles.label}>{msg.speaker === "ai" ? "RoomieScout" : "You"}</div>
            <div style={msg.speaker === "ai" ? styles.bubbleAi : styles.bubbleUser}>{msg.text}</div>
          </div>
        ))}
      </div>

      <audio ref={playerRef} style={{ display: "none" }} />
    </div>
  );
}
