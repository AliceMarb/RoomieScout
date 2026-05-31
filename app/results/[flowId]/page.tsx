import ResultsView from "@/components/ResultsView";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Compatibility results
          </h1>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ResultsView flowId={flowId} />
        </section>
      </div>
    </main>
  );
}
