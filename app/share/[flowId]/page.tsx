import SharePanel from "@/components/SharePanel";

export default async function SharePage({
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
            Invite your potential roommate
          </h1>
          <p className="text-sm text-slate-500">
            Share the link below. They&apos;ll talk to the AI too, then we&apos;ll
            score your compatibility.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SharePanel flowId={flowId} />
        </section>
      </div>
    </main>
  );
}
