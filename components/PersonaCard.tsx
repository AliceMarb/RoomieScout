import type { Persona } from "@/lib/business-logic";
import { Card } from "@/components/ui";

export default function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6">
        <div className="rule-label">
          <span className="eyebrow">Housemate Type</span>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-line bg-paper text-3xl">
            {persona.emoji}
          </div>
          <div className="min-w-0">
            <p className="font-display text-3xl font-bold tracking-[0.28em] text-ink tnum">
              {persona.code}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-ink">
              {persona.title}
            </h2>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {persona.description}
        </p>
      </div>

      {/* Spectrum */}
      <div className="mt-6 divide-y divide-line border-t border-line">
        {persona.axes.map((a) => {
          const leansLeft = a.chosen === "left";
          const chosenLabel = leansLeft ? a.left : a.right;
          const pos = leansLeft ? 50 - (a.strength - 50) : 50 + (a.strength - 50);
          return (
            <div key={a.name} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="eyebrow">{a.name}</span>
                <span className="text-xs font-medium text-accent-ink tnum">
                  {a.strength}% {chosenLabel}
                </span>
              </div>

              <div className="relative mt-3 h-px bg-line">
                {/* center tick */}
                <span className="absolute left-1/2 top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-line" />
                {/* fill from center to marker */}
                <span
                  className="absolute top-1/2 h-px -translate-y-1/2 bg-accent"
                  style={{
                    left: `${Math.min(50, pos)}%`,
                    right: `${100 - Math.max(50, pos)}%`,
                  }}
                />
                {/* coral square marker */}
                <span
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-accent"
                  style={{ left: `${pos}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={leansLeft ? "font-medium text-ink" : "text-ink-faint"}>
                  {a.left}
                </span>
                <span className={!leansLeft ? "font-medium text-ink" : "text-ink-faint"}>
                  {a.right}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
