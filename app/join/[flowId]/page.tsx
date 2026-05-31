import JoinForm from "@/components/JoinForm";

export default async function JoinPage({
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
            You&apos;ve been invited to a compatibility test
          </h1>
          <p className="text-sm text-slate-500">
            Answer a few things and we&apos;ll see how well you&apos;d room together.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <JoinForm flowId={flowId} />
        </section>
      </div>
    </main>
  );
}
