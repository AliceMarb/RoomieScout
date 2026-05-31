"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function StartMatchingForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        flowId?: string;
        error?: string;
      };
      if (!res.ok || !data.flowId) {
        setError(data.error || "Request failed");
        setSubmitting(false);
        return;
      }
      router.push(`/share/${data.flowId}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* TODO: replace this text input with the dynamic voice-based AI agent that
          interviews the user and builds the compatibility profile. */}
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-slate-700">
          Tell the AI what matters to you in a roommate
        </label>
        <textarea
          id="text"
          required
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I'm tidy, work from home, early sleeper, splitting rent evenly…"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
      >
        {submitting ? "Starting…" : "Start compatibility test"}
      </button>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
