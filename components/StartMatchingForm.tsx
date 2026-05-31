"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Field, Textarea } from "@/components/ui";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* TODO: replace this text input with the dynamic voice-based AI agent that
          interviews the user and builds the compatibility profile. */}
      <Field
        label="What matters to you at home"
        htmlFor="text"
        hint="A few sentences is enough — our AI takes it from here."
      >
        <Textarea
          id="text"
          required
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I'm tidy, work from home, early sleeper, splitting rent evenly…"
        />
      </Field>

      <Button type="submit" variant="accent" disabled={submitting} className="w-full">
        {submitting ? "Starting…" : "Reveal my Housemate Type"}
      </Button>

      {error ? (
        <p className="text-sm text-accent-ink" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
