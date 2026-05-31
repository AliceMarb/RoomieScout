"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

const SHARE_MESSAGE =
  "Let's find out if we'd make good roommates! Take this quick compatibility test:";

export default function SharePanel({ flowId }: { flowId: string }) {
  const [joinUrl, setJoinUrl] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${flowId}`);
  }, [flowId]);

  const shareLinks = useMemo(() => {
    const text = encodeURIComponent(`${SHARE_MESSAGE} ${joinUrl}`);
    return {
      whatsapp: `https://wa.me/?text=${text}`,
      sms: `sms:?&body=${text}`,
      email: `mailto:?subject=${encodeURIComponent(
        "Are we roommate compatible?",
      )}&body=${text}`,
    };
  }, [joinUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/flows/${flowId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const shareButtonClass =
    "flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Share with your potential roommate
        </h3>
        <p className="text-xs text-slate-500">
          Send them the link — they&apos;ll take the test too.
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={shareButtonClass}
          >
            💬 WhatsApp
          </a>
          <a href={shareLinks.sms} className={shareButtonClass}>
            📱 Text
          </a>
          <a href={shareLinks.email} className={shareButtonClass}>
            ✉️ Email
          </a>
          <button type="button" onClick={copyLink} className={shareButtonClass}>
            {copied ? "✓ Copied" : "🔗 Copy link"}
          </button>
        </div>

        <input
          readOnly
          value={joinUrl}
          className="mt-2 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-200 pt-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Get notified when results are ready
          </label>
          <p className="text-xs text-slate-500">
            We&apos;ll email you once your roommate finishes the test.
          </p>
          <div className="mt-1 flex gap-2">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={submitting}
              className="shrink-0 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "Saving…" : saved ? "Saved ✓" : "Notify me"}
            </button>
          </div>
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
