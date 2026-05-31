"use client";

import { useState, type FormEvent } from "react";

type SubmitResult = {
  message: string;
};

export default function SubmitForm() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json().catch(() => ({}))) as
        | SubmitResult
        | { error?: string };
      if (!res.ok) {
        setError(("error" in data && data.error) || "Request failed");
        return;
      }
      setResult(data as SubmitResult);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-slate-700">
            Your input
          </label>
          <textarea
            id="text"
            required
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type anything…"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Response</h2>
          <p className="mt-2 text-sm text-slate-700">{result.message}</p>
        </div>
      ) : null}
    </div>
  );
}
