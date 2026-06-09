import type { Persona } from "@/lib/personas";

export default function PersonaSpectrum({ persona }: { persona: Persona }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Your HMTI breakdown</h3>
        <p className="text-xs text-slate-500">{persona.description}</p>
      </div>
      <div className="space-y-4 px-6 py-5">
        {persona.axes.map((a) => {
          const leansLeft = a.chosen === "left";
          const chosenLabel = leansLeft ? a.left : a.right;
          const pos = leansLeft ? 50 - (a.strength - 50) : 50 + (a.strength - 50);
          return (
            <div key={a.name}>
              <div className="flex items-center justify-between text-xs">
                <span
                  className={leansLeft ? "font-semibold text-slate-900" : "text-slate-400"}
                >
                  {a.left}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  {a.name}
                </span>
                <span
                  className={!leansLeft ? "font-semibold text-slate-900" : "text-slate-400"}
                >
                  {a.right}
                </span>
              </div>
              <div className="relative mt-1.5 h-2 rounded-full bg-slate-100">
                <div
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                  style={{
                    left: `${Math.min(50, pos)}%`,
                    right: `${100 - Math.max(50, pos)}%`,
                  }}
                />
                <div
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-violet-600 bg-white shadow"
                  style={{ left: `${pos}%` }}
                />
              </div>
              <p
                className={`mt-1 text-[11px] font-medium text-violet-600 ${
                  leansLeft ? "text-left" : "text-right"
                }`}
              >
                {a.strength}% {chosenLabel}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
