"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Field, Textarea } from "@/components/ui";

export default function JoinForm({ flowId }: { flowId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/flows/${flowId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Request failed");
        setSubmitting(false);
        return;
      }
      router.push(`/results/${flowId}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* TODO: replace this text input with the dynamic voice-based AI agent that
          already has the initiator's context and interviews the roommate. */}
      <Field
        label="What matters to you at home"
        htmlFor="text"
        hint="Tell our AI how you like to live — it only takes a minute."
      >
        <Textarea
          id="text"
          required
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I keep odd hours, love having friends over, very tidy…"
        />
      </Field>

      <Button type="submit" variant="accent" disabled={submitting} className="w-full">
        {submitting ? "Submitting…" : "See how we match"}
      </Button>

      {error ? (
        <p className="text-sm text-accent-ink" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
