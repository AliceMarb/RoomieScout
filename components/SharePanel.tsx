"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button, Input, RuleLabel } from "@/components/ui";

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

  const shareTile =
    "flex items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/[0.04]";

  return (
    <div className="space-y-6">
      <div>
        <RuleLabel>Share the test</RuleLabel>
        <p className="mt-3 text-sm text-ink-soft">
          Send the link to a potential roommate — they&apos;ll take the test too.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={shareTile}
          >
            💬 WhatsApp
          </a>
          <a href={shareLinks.sms} className={shareTile}>
            📱 Text
          </a>
          <a href={shareLinks.email} className={shareTile}>
            ✉️ Email
          </a>
          <button type="button" onClick={copyLink} className={shareTile}>
            {copied ? "✓ Copied" : "🔗 Copy"}
          </button>
        </div>

        <Input readOnly value={joinUrl} className="mt-2 bg-paper text-ink-soft" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 border-t border-line pt-6">
        <div>
          <label htmlFor="email" className="block">
            <span className="eyebrow">Get notified when results are ready</span>
          </label>
          <p className="mt-1.5 text-xs text-ink-soft">
            We&apos;ll email you once your roommate finishes the test.
          </p>
          <div className="mt-2 flex gap-2">
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Button
              type="submit"
              variant="solid"
              disabled={submitting}
              className="shrink-0"
            >
              {submitting ? "Saving…" : saved ? "Saved ✓" : "Notify me"}
            </Button>
          </div>
        </div>
        {error ? (
          <p className="text-sm text-accent-ink" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
