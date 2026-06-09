"use client";

import { useEffect, useRef, useState } from "react";
import type { Persona } from "@/lib/personas";
import { getAvatarPublicPath, getPersonaMeta } from "@/lib/personas";
import MascotIllustration from "@/components/MascotIllustration";

type ShareableAvatarCardProps = {
  persona: Persona;
  className?: string;
};

export default function ShareableAvatarCard({
  persona,
  className = "",
}: ShareableAvatarCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [useGeneratedArt, setUseGeneratedArt] = useState(true);
  // Resolve the Web Share availability only after mount so the first client
  // render matches the server (both show "Copy card text"), avoiding a
  // hydration mismatch.
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);
  const meta = getPersonaMeta(persona.code);
  const generatedSrc = getAvatarPublicPath(persona.code);
  const { palette } = meta;
  const displayTitle = meta.title;
  // Decode the code into the word each letter stands for, e.g.
  // COSL → ["Casual", "Open", "Stable", "Laid-back"], shown as the card's
  // trait chips so the acronym reads as plain language instead of an
  // unexplained four-letter code.
  const decodedTraits = persona.axes.map((axis) =>
    axis.chosen === "left" ? axis.left : axis.right,
  );

  async function handleShare() {
    const text = [
      `${persona.code} — ${displayTitle}`,
      `"${meta.tagline}"`,
      meta.traitBadges.join(" · "),
      "",
      `Superpower: ${meta.roommateSuperpower}`,
      `Best matches: ${meta.bestMatches.join(", ")}`,
      "",
      "My Housemate Type on Homi",
    ].join("\n");

    const nav = typeof window !== "undefined" ? window.navigator : undefined;
    if (nav && "share" in nav && typeof nav.share === "function") {
      setSharing(true);
      try {
        await nav.share({ title: displayTitle, text });
      } catch {
        /* cancelled */
      } finally {
        setSharing(false);
      }
    } else if (nav?.clipboard) {
      await nav.clipboard.writeText(text);
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Front card — square, story-shareable */}
      <div
        ref={cardRef}
        className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-[28px] shadow-xl ring-1 ring-black/5"
        style={{
          background: `linear-gradient(165deg, ${palette.bgFrom} 0%, ${palette.bgTo} 55%, ${palette.soft} 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-6 top-12 h-28 w-28 rounded-full opacity-40 blur-2xl"
            style={{ background: palette.accent }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-white/60 to-transparent" />
        </div>

        <div className="relative flex h-full flex-col px-5 pb-5 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500/80">
            Homi · HMTI
          </p>
          <p
            className="font-mono text-4xl font-black tracking-[0.15em]"
            style={{ color: palette.badgeText }}
          >
            {persona.code}
          </p>
          <h2 className="text-base font-bold leading-tight text-slate-800">{displayTitle}</h2>

          <div className="relative mx-auto mt-1 flex flex-1 flex-col items-center justify-center overflow-hidden">
            {useGeneratedArt ? (
              <div className="flex flex-1 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedSrc}
                  alt={`${meta.title} — ${meta.animal} mascot`}
                  className="h-auto max-h-[160px] w-auto max-w-full object-contain drop-shadow-md"
                  onError={() => setUseGeneratedArt(false)}
                />
              </div>
            ) : (
              <div
                className="flex h-[52%] w-[58%] max-h-[140px] items-end justify-center rounded-[45%] pb-1"
                style={{
                  background: `radial-gradient(circle at 50% 85%, ${palette.soft} 0%, transparent 72%)`,
                }}
              >
                <MascotIllustration
                  animal={meta.animal}
                  accent={palette.accent}
                  soft={palette.soft}
                />
              </div>
            )}
          </div>

          <div className="mt-auto space-y-2.5">
            <p
              className="text-center text-sm font-semibold italic leading-snug"
              style={{ color: palette.badgeText }}
            >
              &ldquo;{meta.tagline}&rdquo;
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {decodedTraits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm"
                  style={{ background: palette.badge, color: palette.badgeText }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded back card */}
      <div className="mx-auto w-full max-w-[320px]">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          {expanded ? "Hide details" : "See superpower & best matches"}
        </button>

        {expanded ? (
          <div
            className="mt-2 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            style={{ borderColor: `${palette.accent}33` }}
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Roommate superpower
              </p>
              <p className="mt-1 text-sm text-slate-700">{meta.roommateSuperpower}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Danger zone
              </p>
              <p className="mt-1 text-sm text-slate-700">{meta.dangerZone}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Best matches
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {meta.bestMatches.map((code) => (
                  <span
                    key={code}
                    className="rounded-full px-2.5 py-1 font-mono text-[11px] font-bold"
                    style={{ background: palette.badge, color: palette.badgeText }}
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Household energy
              </p>
              <p className="mt-1 text-sm italic text-slate-600">{meta.householdEnergy}</p>
            </div>
            <p className="text-[10px] leading-snug text-slate-400">{meta.scene}</p>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {sharing ? "Sharing…" : canShare ? "Share your type" : "Copy card text"}
        </button>
      </div>
    </div>
  );
}
