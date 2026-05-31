import PersonaCard from "@/components/PersonaCard";
import SharePanel from "@/components/SharePanel";
import { getFlow } from "@/lib/store";

export default async function SharePage({
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
            Meet your Housemate Type
          </h1>
          <p className="text-sm text-slate-500">
            This is your HMTI. Share the test with a potential roommate to see how
            you match.
          </p>
        </header>

        {flow ? (
          <PersonaCard persona={flow.initiatorPersona} />
        ) : (
          <p className="text-sm text-red-600">
            This matching flow was not found. It may have expired — start a new one
            from the home page.
          </p>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SharePanel flowId={flowId} />
        </section>
      </div>
    </main>
  );
}
