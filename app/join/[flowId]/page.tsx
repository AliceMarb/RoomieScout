import JoinForm from "@/components/JoinForm";
import { getFlow } from "@/lib/store";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;
  const flow = getFlow(flowId);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">
            Someone wants to know if you&apos;d be great roommates 👋
          </h1>
          <p className="text-sm text-slate-500">
            Chat with our AI for a minute — we&apos;ll figure out your Housemate Type
            and see how well you two match.
          </p>
        </header>

        {flow ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <JoinForm flowId={flowId} />
          </section>
        ) : (
          <p className="text-sm text-red-600">
            This invite link wasn&apos;t found. Ask your roommate to send a fresh one.
          </p>
        )}
      </div>
    </main>
  );
}
