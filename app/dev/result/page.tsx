import { PageShell, Wordmark } from "@/components/ui";
import ShareableAvatarCard from "@/components/ShareableAvatarCard";
import type { Persona } from "@/concepts/personas";

const DEMO_PERSONA: Persona = {
  code: "NPDS",
  title: "The Night Owl Perfectionist",
  emoji: "🦉",
  description: "Quiet and tidy, direct about issues, and likes clear agreements.",
  axes: [
    { name: "Cleanliness",        left: "Neat",       right: "Casual",      chosen: "left",  strength: 82 },
    { name: "Social intensity",   left: "Private",    right: "Open",        chosen: "left",  strength: 75 },
    { name: "Conflict style",     left: "Direct",     right: "Harmonious",  chosen: "left",  strength: 70 },
    { name: "Structure preference", left: "Structured", right: "Flexible",  chosen: "left",  strength: 68 },
  ],
};

export default function DevResultPage() {
  return (
    <PageShell>
      <Wordmark />
      <div className="mt-8 max-w-md mx-auto">
        <p className="eyebrow text-ink-faint mb-6">dev — result preview</p>
        <ShareableAvatarCard persona={DEMO_PERSONA} />
      </div>
    </PageShell>
  );
}
