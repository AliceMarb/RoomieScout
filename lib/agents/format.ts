import type { Message } from "@/lib/transcriptStore";

const DOMAIN_LABELS: Record<string, string> = {
  communication: "communication",
  cleanliness: "cleanliness",
  social: "social",
  personal_space: "personal_space",
};

export function formatTranscript(transcript: Message[]): string {
  return transcript
    .map((m) => {
      if (m.speaker === "user") return `User: ${m.text}`;
      const tag = m.domain && DOMAIN_LABELS[m.domain] ? ` [${DOMAIN_LABELS[m.domain]}]` : "";
      return `Scout${tag}: ${m.text}`;
    })
    .join("\n");
}
