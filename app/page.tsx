import Link from "next/link";
import { PageShell, Wordmark, cn } from "@/components/ui";

export default function LandingPage() {
  return (
    <PageShell>
      <Wordmark />

      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center">
        {/* Hero */}
        <div className="space-y-4 max-w-md">
          <p className="eyebrow tracking-widest text-accent-ink">
            HMTI · Housemate Type Indicator
          </p>
          <h1 className={cn("font-display font-bold leading-[1.08] text-ink", "text-[clamp(2.75rem,8vw,4.5rem)]")}>
            Find out your<br />roommate type.
          </h1>
          <p className="text-ink-soft text-lg leading-relaxed">
            16 personalities. One short quiz.<br />No awkward surprises.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-8 py-3.5 text-base font-medium text-paper transition-colors hover:bg-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Get Started
            <span aria-hidden>→</span>
          </Link>
          <p className="eyebrow text-ink-faint">Free · ~2 minutes</p>
        </div>
      </div>
    </PageShell>
  );
}
