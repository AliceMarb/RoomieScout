"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Input, RuleLabel, cn } from "@/components/ui";

const emailValid = (v: string) => /\S+@\S+\.\S+/.test(v.trim());

type Mode = "share" | "match";

export default function SharePanel({ flowId }: { flowId: string }) {
  const router = useRouter();
  const [joinUrl, setJoinUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<Mode>("share");

  // Your details — required, shared by both actions.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [savingLink, setSavingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const [theirEmail, setTheirEmail] = useState("");
  const [pairing, setPairing] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [pairError, setPairError] = useState<string | null>(null);

  const detailsValid = name.trim().length > 0 && emailValid(email);

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${flowId}`);
  }, [flowId]);

  // Persist name + email so we can email this person their result later.
  async function saveDetails(): Promise<boolean> {
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
    return emailRes.ok && nameRes.ok;
  }

  function writeClipboard(text: string): boolean {
    // Copy synchronously, within the click gesture — awaiting first would expire
    // the user activation and make the Clipboard API reject (notably on Safari).
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
    } catch {
      /* fall through to async API */
    }
    navigator.clipboard?.writeText(text).catch(() => {});
    return Boolean(navigator.clipboard);
  }

  async function copyLink() {
    if (!detailsValid) return;
    setLinkError(null);

    // 1. Copy right away so the gesture isn't lost.
    if (writeClipboard(joinUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      setLinkError("Couldn't copy — select the link and copy it manually.");
    }

    // 2. Persist the email so they actually receive their result.
    setSavingLink(true);
    try {
      if (!(await saveDetails())) {
        setLinkError("Couldn't save your email. Please try again.");
      }
    } catch {
      setLinkError("Couldn't save your email. Please try again.");
    } finally {
      setSavingLink(false);
    }
  }

  async function handlePair(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPairError(null);
    setPairing(true);
    try {
      const res = await fetch("/api/flows/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowId, name, email, roommateEmail: theirEmail }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        error?: string;
      };
      if (!res.ok) {
        setPairError(data.error || "Request failed");
        return;
      }
      if (data.status === "matched") {
        router.push(`/results/${flowId}`);
        return;
      }
      setWaiting(true);
    } catch {
      setPairError("Network error. Please try again.");
    } finally {
      setPairing(false);
    }
  }

  const copyTile =
    "flex shrink-0 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/[0.04] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface";

  function tabClass(active: boolean) {
    return cn(
      "flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "border-accent bg-accent-soft text-ink"
        : "border-line bg-surface text-ink-soft hover:bg-ink/[0.04]",
    );
  }

  if (waiting) {
    return (
      <div className="rounded-md border border-line bg-surface p-5">
        <p className="text-sm font-medium text-ink">You&apos;re all set ✓</p>
        <p className="mt-1 text-sm text-ink-soft">
          The moment {theirEmail} finishes their test, we&apos;ll email you both the
          result.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Your details (required — also how we send your result) ── */}
      <div>
        <RuleLabel>Your details</RuleLabel>
        <p className="mt-3 text-sm text-ink-soft">
          Where should we send your compatibility result?
        </p>
        <div className="mt-4 space-y-2">
          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* ── Pick how to match ────────────────────────────────────── */}
      <div className="border-t border-line pt-5">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setMode("share")} className={tabClass(mode === "share")}>
            <span aria-hidden>🔗</span> Share a link
          </button>
          <button type="button" onClick={() => setMode("match")} className={tabClass(mode === "match")}>
            <span aria-hidden>🤝</span> Match by email
          </button>
        </div>

        {!detailsValid ? (
          <p className="mt-3 text-xs text-ink-faint">
            Add your name and email above to continue.
          </p>
        ) : null}

        {mode === "share" ? (
          <div className="mt-4">
            <p className="text-sm text-ink-soft">
              Send a potential roommate this link. We&apos;ll email you the result
              when they finish.
            </p>
            <div className="mt-3 flex gap-2">
              <Input readOnly value={joinUrl} className="min-w-0 flex-1 bg-paper text-ink-soft" />
              <button
                type="button"
                onClick={copyLink}
                disabled={!detailsValid || savingLink}
                className={copyTile}
              >
                {savingLink ? "…" : copied ? "✓ Copied" : "🔗 Copy"}
              </button>
            </div>
            {linkError ? (
              <p className="mt-2 text-sm text-accent-ink" role="alert">
                {linkError}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-ink-soft">
              Roommate taking the test on their own? Add their email — we&apos;ll
              pair you and email you both when you&apos;re done. No link needed.
            </p>
            <form onSubmit={handlePair} className="mt-3 flex gap-2">
              <Input
                type="email"
                required
                value={theirEmail}
                onChange={(e) => setTheirEmail(e.target.value)}
                placeholder="Roommate's email"
              />
              <Button
                type="submit"
                variant="accent"
                disabled={pairing || !detailsValid || !theirEmail}
                className="shrink-0"
              >
                {pairing ? "Matching…" : "Match us"}
              </Button>
            </form>
            {pairError ? (
              <p className="mt-2 text-sm text-accent-ink" role="alert">
                {pairError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
