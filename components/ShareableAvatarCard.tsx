"use client";

import { useEffect, useRef, useState } from "react";
import type { Persona } from "@/concepts/personas";
import { getAvatarPublicPath, getPersonaMeta } from "@/concepts/personas";
import { getPersonaMetaV2 } from "@/concepts/personas/meta-v2";
import MascotIllustration from "@/components/MascotIllustration";

export default function ShareableAvatarCard({ persona, className = "" }: { persona: Persona; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [useGeneratedArt, setUseGeneratedArt] = useState(true);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => { setCanShare(typeof navigator !== "undefined" && "share" in navigator); }, []);

  const meta = getPersonaMeta(persona.code);
  const metaV2 = getPersonaMetaV2(persona.code);
  const generatedSrc = getAvatarPublicPath(persona.code);
  const { palette } = meta;
  const displayTitle = metaV2 ? persona.title : meta.title;
  const decodedTraits = persona.axes.map((axis) => axis.chosen === "left" ? axis.left : axis.right);

  async function handleShare() {
    const text = [
      `${persona.code} — ${displayTitle}`,
      `"${metaV2?.tagline ?? meta.tagline}"`,
      decodedTraits.join(" · "),
      "",
      `Superpower: ${metaV2?.roommateSuperpower ?? meta.roommateSuperpower}`,
      `Best matches: ${(metaV2?.bestMatches ?? meta.bestMatches).join(", ")}`,
      "",
      "My Housemate Type on Homi",
    ].join("\n");
    const nav = typeof window !== "undefined" ? window.navigator : undefined;
    if (nav && "share" in nav && typeof nav.share === "function") {
      setSharing(true);
      try { await nav.share({ title: displayTitle, text }); } catch { /* cancelled */ }
      finally { setSharing(false); }
    } else if (nav?.clipboard) {
      await nav.clipboard.writeText(text);
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Row 1: card + quote side by side */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">

        {/* Square avatar card */}
        <div
          ref={cardRef}
          className="relative w-full max-w-[300px] shrink-0 rounded-[36px] shadow-xl ring-1 ring-black/5"
          style={{ background: `linear-gradient(165deg, ${palette.bgFrom} 0%, ${palette.bgTo} 55%, ${palette.soft} 100%)` }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
            <div className="absolute -right-6 top-12 h-28 w-28 rounded-full opacity-40 blur-2xl" style={{ background: palette.accent }} />
            <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-white/60 to-transparent" />
          </div>

          <div className="relative flex flex-col px-6 pb-6 pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500/80">HMTI</p>
            <p className="font-mono text-4xl font-black tracking-[0.15em]" style={{ color: palette.badgeText }}>{persona.code}</p>
            <h2 className="text-base font-bold leading-tight text-slate-800">{displayTitle}</h2>

            <div className="mx-auto mt-3 flex flex-col items-center justify-center px-4">
              {useGeneratedArt ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={generatedSrc}
                  alt={`${displayTitle} mascot`}
                  className="h-auto max-h-[152px] w-auto max-w-full rounded-2xl object-contain drop-shadow-md"
                  onError={() => setUseGeneratedArt(false)}
                />
              ) : (
                <div
                  className="flex h-[52%] w-[58%] max-h-[140px] items-end justify-center rounded-[45%] pb-1"
                  style={{ background: `radial-gradient(circle at 50% 85%, ${palette.soft} 0%, transparent 72%)` }}
                >
                  <MascotIllustration animal={meta.animal} accent={palette.accent} soft={palette.soft} />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-center text-sm font-semibold italic leading-snug" style={{ color: palette.badgeText }}>
                &ldquo;{metaV2?.tagline ?? meta.tagline}&rdquo;
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {decodedTraits.map((trait) => (
                  <span key={trait} className="rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm" style={{ background: palette.badge, color: palette.badgeText }}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quote only to the right */}
        {metaV2 && (
          <div
            className="flex flex-1 items-center rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
            style={{ borderColor: `${palette.accent}33` }}
          >
            <p className="text-base italic leading-relaxed text-slate-600">
              &ldquo;{metaV2.miniBio.replace(/^"|"$/g, "")}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Row 2: single-column details */}
      <div
        className="w-full space-y-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
        style={{ borderColor: `${palette.accent}33` }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Roommate superpower</p>
          <p className="mt-1 text-sm text-slate-700">{metaV2?.roommateSuperpower ?? meta.roommateSuperpower}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Danger zone</p>
          <p className="mt-1 text-sm text-slate-700">{metaV2?.dangerZone ?? meta.dangerZone}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Household energy</p>
          <p className="mt-1 text-sm italic text-slate-600">{metaV2?.householdEnergy ?? meta.householdEnergy}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Connects best with</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(metaV2?.bestMatches ?? meta.bestMatches).map((code) => (
              <span key={code} className="rounded-full px-2.5 py-1 font-mono text-[11px] font-bold" style={{ background: palette.badge, color: palette.badgeText }}>
                {code}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {sharing ? "Sharing…" : canShare ? "Share your type" : "Copy card text"}
          </button>
        </div>
      </div>

    </div>
  );
}
