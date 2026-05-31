import ResultsView from "@/components/ResultsView";
import { PageShell, Wordmark } from "@/components/ui";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;
  return (
    <PageShell>
      <Wordmark />
      <header className="mt-8">
        <span className="eyebrow">The verdict</span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          Compatibility results
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-soft">
          Here&apos;s how your Housemate Types stack up.
        </p>
      </header>

      <div className="mt-8">
        <ResultsView flowId={flowId} />
      </div>
    </PageShell>
  );
}
