"use client";

import { useEffect, useState } from "react";
import { Button, Input, RuleLabel } from "@/components/ui";

const emailValid = (v: string) => /\S+@\S+\.\S+/.test(v.trim());

export default function SharePanel({ flowId }: { flowId: string }) {
  const [joinUrl, setJoinUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${flowId}`);
  }, [flowId]);

  function writeClipboard(text: string): boolean {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) return true;
    } catch { /* fall through */ }
    navigator.clipboard?.writeText(text).catch(() => {});
    return Boolean(navigator.clipboard);
  }

  function copyLink() {
    if (writeClipboard(joinUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function saveEmail() {
    if (!emailValid(email)) return;
    setEmailError(null);
    setSavingEmail(true);
    try {
      const res = await fetch(`/api/flows/${flowId}/send-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setEmailError(d.error || "Couldn't send — try again.");
        return;
      }
      setEmailSaved(true);
    } catch {
      setEmailError("Network error. Try again.");
    } finally {
      setSavingEmail(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <RuleLabel>Share with a potential roommate</RuleLabel>
        <p className="mt-3 text-sm text-ink-soft">
          Send them this link — they'll take the quiz and you'll both see a compatibility score.
        </p>
        <div className="mt-4 flex gap-2">
          <Input readOnly value={joinUrl} className="min-w-0 flex-1 bg-paper text-ink-soft select-all" />
          <Button variant={copied ? "outline" : "accent"} onClick={copyLink} className="shrink-0 px-5">
            {copied ? "Copied ✓" : "Copy link"}
          </Button>
        </div>
      </div>

      {copied && !emailSaved && (
        <div>
          <RuleLabel>Save your results link</RuleLabel>
          <p className="mt-3 text-sm text-ink-soft">Email yourself this link so you can find your results later.</p>
          <div className="mt-4 flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEmail()}
              placeholder="you@example.com"
              className="min-w-0 flex-1"
            />
            <Button variant="solid" disabled={savingEmail || !emailValid(email)} onClick={saveEmail} className="shrink-0">
              {savingEmail ? "Sending…" : "Email me"}
            </Button>
          </div>
          {emailError && <p className="mt-2 text-sm text-accent-ink">{emailError}</p>}
        </div>
      )}

      {emailSaved && <p className="text-sm text-ink-soft">Sent ✓ — check your inbox for the link.</p>}

      <div className="rounded-xl border border-line bg-surface p-5">
        <p className="eyebrow text-accent">Practical report</p>
        <p className="mt-2 text-sm font-medium text-ink">Liking each other isn't the same as being able to live together.</p>
        <p className="mt-1 text-sm text-ink-soft">
          The practical assessment flags the real friction points before you sign a lease.
        </p>
        <a
          href={"/paid/" + flowId}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
        >
          Take the practical assessment →
        </a>
      </div>
    </div>
  );
}
