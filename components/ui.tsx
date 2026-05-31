import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ── Layout ─────────────────────────────────────────────────────────────── */

// Full-screen page canvas with the faint background grid + centered column.
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-paper bg-grid">
      <div className="mx-auto w-full max-w-page px-5 py-10 sm:py-14">{children}</div>
    </main>
  );
}

export function Wordmark() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
      <span className="font-display text-sm font-semibold tracking-tight text-ink">
        RoomieScout
      </span>
    </Link>
  );
}

/* ── Typographic motifs ─────────────────────────────────────────────────── */

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("eyebrow", className)}>{children}</span>;
}

// Tracked label followed by a hairline rule that fills the row — the signature.
export function RuleLabel({ children }: { children: ReactNode }) {
  return (
    <div className="rule-label">
      <Eyebrow>{children}</Eyebrow>
    </div>
  );
}

/* ── Surfaces ───────────────────────────────────────────────────────────── */

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.03)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── Controls ───────────────────────────────────────────────────────────── */

type Variant = "solid" | "accent" | "outline" | "ghost";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:bg-ink/90",
  accent: "bg-accent text-white hover:bg-accent-ink",
  outline: "border border-line bg-surface text-ink hover:bg-ink/[0.04]",
  ghost: "text-ink-soft hover:text-ink",
};

export function Button({
  variant = "solid",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

const fieldBase =
  "block w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "resize-none", className)} {...props} />;
}

// Label + control pairing.
export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block">
        <span className="eyebrow">{label}</span>
      </label>
      {hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}
      {children}
    </div>
  );
}
