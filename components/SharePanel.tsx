"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Input, RuleLabel } from "@/components/ui";

export default function SharePanel({ flowId }: { flowId: string }) {
  const [joinUrl, setJoinUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${flowId}`);
  }, [flowId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const [emailRes, nameRes] = await Promise.all([
        fetch(`/api/flows/${flowId}/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }),
        fetch(`/api/flows/${flowId}/name`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, role: "initiator" }),
        }),
      ]);
      const failed = !emailRes.ok ? emailRes : !nameRes.ok ? nameRes : null;
      if (failed) {
        const data = (await failed.json().catch(() => ({}))) as { error?: string };
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

        <div className="mt-4 flex gap-2">
          <Input readOnly value={joinUrl} className="min-w-0 flex-1 bg-paper text-ink-soft" />
          <button type="button" onClick={copyLink} className={`${shareTile} shrink-0`}>
            {copied ? "✓ Copied" : "🔗 Copy"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 border-t border-line pt-6">
        <div>
          <label htmlFor="name" className="block">
            <span className="eyebrow">Get notified when results are ready</span>
          </label>
          <p className="mt-1.5 text-xs text-ink-soft">
            We&apos;ll email you once your roommate finishes the test.
          </p>
          <Input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-2"
          />
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
