/** Cute rounded mascot SVGs — sticker-style, not realistic. */
export default function MascotIllustration({
  animal,
  accent,
  soft,
}: {
  animal: string;
  accent: string;
  soft: string;
}) {
  const body = { fill: accent, stroke: "rgba(0,0,0,0.06)", strokeWidth: 1.5 };
  const eye = "#2d2a32";

  switch (animal) {
    case "owl":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <ellipse cx="60" cy="72" rx="44" ry="40" {...body} />
          <circle cx="48" cy="66" r="13" fill="#fff" opacity="0.9" />
          <circle cx="72" cy="66" r="13" fill="#fff" opacity="0.9" />
          <circle cx="48" cy="66" r="5" fill={eye} />
          <circle cx="72" cy="66" r="5" fill={eye} />
          <rect x="44" y="52" width="32" height="8" rx="4" fill={soft} opacity="0.9" />
          <path d="M56 84 L60 90 L64 84 Z" fill="#f0a848" />
        </svg>
      );
    case "cat":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <path d="M30 48 L42 22 L54 48 Z" fill={soft} />
          <path d="M66 48 L78 22 L90 48 Z" fill={soft} />
          <ellipse cx="60" cy="74" rx="40" ry="34" {...body} />
          <path d="M46 68 Q48 64 50 68" stroke={eye} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M70 68 Q72 64 74 68" stroke={eye} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M54 82 Q60 86 66 82" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "ferret":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <ellipse cx="60" cy="78" rx="44" ry="28" fill="#f8f8f8" stroke={accent} strokeWidth="1.5" />
          <ellipse cx="60" cy="52" rx="28" ry="26" fill="#fff" stroke={accent} strokeWidth="1.5" />
          <circle cx="50" cy="50" r="3.5" fill={eye} />
          <circle cx="70" cy="50" r="3.5" fill={eye} />
          <ellipse cx="60" cy="58" rx="5" ry="3" fill="#ffb4c0" opacity="0.5" />
          <circle cx="28" cy="70" r="3" fill="#fff" opacity="0.8" />
          <circle cx="92" cy="65" r="2.5" fill="#fff" opacity="0.7" />
        </svg>
      );
    case "golden-retriever":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <ellipse cx="40" cy="40" rx="18" ry="24" fill="#f0d080" />
          <ellipse cx="80" cy="40" rx="18" ry="24" fill="#f0d080" />
          <ellipse cx="60" cy="74" rx="44" ry="36" fill="#e8b848" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <circle cx="48" cy="68" r="4.5" fill={eye} />
          <circle cx="72" cy="68" r="4.5" fill={eye} />
          <path d="M46 84 Q60 96 74 84" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="60" cy="86" rx="12" ry="8" fill="#fff" opacity="0.4" />
        </svg>
      );
    case "corgi":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <ellipse cx="38" cy="36" rx="16" ry="20" fill="#f0c878" />
          <ellipse cx="82" cy="36" rx="16" ry="20" fill="#f0c878" />
          <ellipse cx="60" cy="70" rx="44" ry="34" fill="#e8a848" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <rect x="38" y="88" width="12" height="8" rx="4" fill="#f0c878" />
          <rect x="70" y="88" width="12" height="8" rx="4" fill="#f0c878" />
          <circle cx="48" cy="64" r="4" fill={eye} />
          <circle cx="72" cy="64" r="4" fill={eye} />
          <path d="M48 78 Q60 88 72 78" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "red-panda":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <ellipse cx="36" cy="40" rx="16" ry="18" fill="#e87868" />
          <ellipse cx="84" cy="40" rx="16" ry="18" fill="#e87868" />
          <ellipse cx="60" cy="72" rx="42" ry="36" fill="#e87868" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <ellipse cx="60" cy="78" rx="22" ry="16" fill="#fff" opacity="0.55" />
          <circle cx="48" cy="66" r="4" fill={eye} />
          <circle cx="72" cy="66" r="4" fill={eye} />
          <ellipse cx="60" cy="58" rx="14" ry="10" fill="#fff" opacity="0.4" />
          <path d="M52 82 Q60 88 68 82" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "parrot":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <path d="M50 20 L60 8 L70 20 Z" fill="#48b8d4" />
          <ellipse cx="60" cy="72" rx="38" ry="34" fill="#58c878" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <ellipse cx="44" cy="68" rx="14" ry="12" fill="#e878a8" opacity="0.8" />
          <ellipse cx="76" cy="68" rx="14" ry="12" fill="#e8c848" opacity="0.8" />
          <circle cx="50" cy="64" r="4" fill={eye} />
          <circle cx="70" cy="64" r="4" fill={eye} />
          <path d="M78 62 L94 58 L80 70 Z" fill="#f0a848" />
          <path d="M50 82 Q60 90 70 82" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "turtle":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <ellipse cx="60" cy="76" rx="48" ry="32" fill={soft} stroke={accent} strokeWidth="1.5" />
          <circle cx="60" cy="40" r="22" {...body} />
          <circle cx="52" cy="38" r="3" fill={eye} />
          <circle cx="68" cy="38" r="3" fill={eye} />
          <path d="M54 46 Q60 50 66 46" stroke={eye} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "panda":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <ellipse cx="60" cy="74" rx="44" ry="36" fill="#f5f5f5" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
          <circle cx="48" cy="68" r="8" fill="#2d2a32" />
          <circle cx="72" cy="68" r="8" fill="#2d2a32" />
          <ellipse cx="38" cy="42" rx="14" ry="16" fill="#2d2a32" />
          <ellipse cx="82" cy="42" rx="14" ry="16" fill="#2d2a32" />
          <circle cx="48" cy="66" r="3" fill="#fff" />
          <circle cx="72" cy="66" r="3" fill="#fff" />
          <ellipse cx="60" cy="78" rx="8" ry="5" fill="#2d2a32" opacity="0.2" />
        </svg>
      );
    case "hedgehog":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          {[48, 54, 60, 66, 72].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1={28}
              x2={x + (i - 2) * 2}
              y2={48}
              stroke={accent}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          <ellipse cx="60" cy="72" rx="40" ry="34" fill={soft} stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <circle cx="48" cy="68" r="3.5" fill={eye} />
          <circle cx="72" cy="68" r="3.5" fill={eye} />
          <ellipse cx="60" cy="76" rx="6" ry="4" fill="#2d2a32" opacity="0.15" />
        </svg>
      );
    case "bat":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <path d="M8 55 Q30 35 50 55 L50 75 Q30 60 8 70 Z" fill={soft} />
          <path d="M112 55 Q90 35 70 55 L70 75 Q90 60 112 70 Z" fill={soft} />
          <ellipse cx="60" cy="58" rx="22" ry="20" {...body} />
          <path d="M44 58 Q46 52 48 58" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M72 58 Q74 52 76 58" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="60" cy="64" rx="4" ry="3" fill="#ffb4c0" opacity="0.5" />
        </svg>
      );
    case "capybara":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <ellipse cx="60" cy="72" rx="48" ry="36" fill="#c49050" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <rect x="36" y="50" width="48" height="14" rx="7" fill={soft} opacity="0.8" />
          <circle cx="48" cy="68" r="3.5" fill={eye} />
          <circle cx="72" cy="68" r="3.5" fill={eye} />
          <ellipse cx="60" cy="78" rx="14" ry="7" fill="#5c4030" opacity="0.3" />
          <path d="M50 84 Q60 90 70 84" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "bear":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <circle cx="36" cy="36" r="16" fill="#d4a050" />
          <circle cx="84" cy="36" r="16" fill="#d4a050" />
          <ellipse cx="60" cy="76" rx="46" ry="38" fill="#d4a050" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <ellipse cx="60" cy="82" rx="20" ry="14" fill="#f5e8c8" opacity="0.7" />
          <circle cx="48" cy="70" r="4" fill={eye} />
          <circle cx="72" cy="70" r="4" fill={eye} />
          <ellipse cx="60" cy="76" rx="6" ry="4" fill="#2d2a32" opacity="0.2" />
        </svg>
      );
    case "raccoon":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <ellipse cx="60" cy="72" rx="42" ry="36" fill="#6e7a8a" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <ellipse cx="60" cy="58" rx="28" ry="20" fill="#fff" opacity="0.75" />
          <ellipse cx="36" cy="42" rx="14" ry="18" fill="#6e7a8a" />
          <ellipse cx="84" cy="42" rx="14" ry="18" fill="#6e7a8a" />
          <circle cx="48" cy="68" r="4" fill={eye} />
          <circle cx="72" cy="68" r="4" fill={eye} />
          <path d="M52 82 Q60 88 68 82" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "otter":
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <ellipse cx="60" cy="70" rx="40" ry="34" fill={accent} stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <ellipse cx="60" cy="78" rx="22" ry="16" fill="#fff" opacity="0.55" />
          <circle cx="48" cy="64" r="4" fill={eye} />
          <circle cx="72" cy="64" r="4" fill={eye} />
          <ellipse cx="60" cy="72" rx="8" ry="5" fill="#2d2a32" opacity="0.2" />
          <path d="M50 78 Q60 86 70 78" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="28" cy="88" rx="14" ry="10" fill={accent} stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <ellipse cx="92" cy="88" rx="14" ry="10" fill={accent} stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
          <ellipse cx="28" cy="86" rx="8" ry="5" fill="#fff" opacity="0.4" />
          <ellipse cx="92" cy="86" rx="8" ry="5" fill="#fff" opacity="0.4" />
          <rect x="52" y="38" width="16" height="10" rx="3" fill="#f0a848" transform="rotate(-15 60 43)" />
        </svg>
      );
    case "fox":
    default:
      return (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          <path d="M28 50 L40 18 L52 50 Z" fill={soft} />
          <path d="M68 50 L80 18 L92 50 Z" fill={soft} />
          <ellipse cx="60" cy="74" rx="42" ry="36" {...body} />
          <ellipse cx="60" cy="80" rx="18" ry="14" fill="#fff" opacity="0.55" />
          <circle cx="48" cy="68" r="4" fill={eye} />
          <circle cx="72" cy="68" r="4" fill={eye} />
          <path d="M52 82 Q60 90 68 82" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
  }
}
