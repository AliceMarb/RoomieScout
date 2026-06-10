"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Persona } from "@/lib/personas";
import { getPersonaMeta } from "@/lib/personas";
import ShareableAvatarCard from "@/components/ShareableAvatarCard";
import { Button, Input, RuleLabel } from "@/components/ui";

type Stage = "result" | "match" | "saved";

function stripThe(title: string) {
  return title.startsWith("The ") ? title.slice(4) : title;
}

export default function ShareResult({
  flowId,
  persona,
}: {
  flowId: string;
  persona: Persona;
}) {
  const [stage, setStage] = useState<Stage>("result");
  const [joinUrl, setJoinUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${flowId}`);
  }, [flowId]);

  const meta = getPersonaMeta(persona.code);
  const bestMatchNames = meta.bestMatches.map((code) =>
    stripThe(getPersonaMeta(code).title),
  );

  function copyLink() {
    if (!joinUrl) return;
    try {
      const ta = document.createElement("textarea");
      ta.value = joinUrl;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {
      navigator.clipboard?.writeText(joinUrl).catch(() => {});
    }
    setCopied(true);
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/flows/${flowId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSaveError(data.error || "Couldn't save. Please try again.");
        return;
      }
      setStage("saved");
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (stage === "result") {
    return (
      <div className="space-y-8">
        <ShareableAvatarCard persona={persona} />

        <div>
          <RuleLabel>Your Type</RuleLabel>
          <p className="mt-3 font-display text-4xl font-bold leading-tight text-ink">
            {stripThe(meta.title)}
          </p>
        </div>

        <div>
          <RuleLabel>You connect best with</RuleLabel>
          <ul className="mt-4 space-y-2">
            {bestMatchNames.map((name) => (
              <li key={name} className="flex items-center gap-2.5 text-sm text-ink">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {name}
              </li>
            ))}
          </ul>
        </div>

        <Button variant="solid" onClick={() => setStage("match")} className="w-full">
          Compare with someone →
        </Button>
      </div>
    );
  }

  if (stage === "saved") {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">All set ✓</p>
        <p className="text-sm text-ink-soft">
          We&apos;ll email you when your roommate finishes so you can see the comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setStage("result")}
        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
      >
        ← Back
      </button>

      <RuleLabel>Share this link with a friend</RuleLabel>

      <Button
        variant="accent"
        onClick={copyLink}
        disabled={!joinUrl}
        className="w-full"
      >
        {copied ? "Link copied ✓" : "Copy Link"}
      </Button>

      {copied && (
        <div className="space-y-4 border-t border-line pt-5">
          <p className="text-sm text-ink-soft">
            Want us to save your results and notify you when they finish?
          </p>
          <form onSubmit={handleSave} className="flex gap-2">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Button
              type="submit"
              variant="solid"
              disabled={saving || !email}
              className="shrink-0"
            >
              {saving ? "Saving…" : "Save Results"}
            </Button>
          </form>
          {saveError && (
            <p className="text-sm text-accent-ink" role="alert">
              {saveError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
