import FlowNotFound from "@/components/FlowNotFound";
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

  if (!flow) {
    return (
      <FlowNotFound
        title="Test not found"
        message="This compatibility test doesn't exist or has expired. Start a fresh one to get your Housemate Type."
      />
    );
  }

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

        <PersonaCard persona={flow.initiatorPersona} />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SharePanel flowId={flowId} />
        </section>
      </div>
    </main>
  );
}
