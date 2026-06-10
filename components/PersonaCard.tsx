import type { Persona } from "@/concepts/personas";
import PersonaSpectrum from "@/components/PersonaSpectrum";
import ShareableAvatarCard from "@/components/ShareableAvatarCard";

export default function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <div className="space-y-6">
      <ShareableAvatarCard persona={persona} />
      <PersonaSpectrum persona={persona} />
    </div>
  );
}
