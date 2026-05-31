import FlowNotFound from "@/components/FlowNotFound";
import PersonaCard from "@/components/PersonaCard";
import SharePanel from "@/components/SharePanel";
import { Card, PageShell, Wordmark } from "@/components/ui";
import { getFlow } from "@/lib/store";

export default async function SharePage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;
  const flow = await getFlow(flowId);

  if (!flow) {
    return (
      <FlowNotFound
        title="Test not found"
        message="This compatibility test doesn't exist or has expired. Start a fresh one to get your Housemate Type."
      />
    );
  }

  return (
    <PageShell>
      <Wordmark />
      <header className="mt-8">
        <span className="eyebrow">Your result</span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          Meet your Housemate Type
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-soft">
          This is your HMTI — save or share your avatar card, then send the test to a
          potential roommate.
        </p>
      </header>

      <div className="mt-8 space-y-6">
        <PersonaCard persona={flow.initiatorPersona} />
        <Card className="p-6">
          <SharePanel flowId={flowId} />
        </Card>
      </div>
    </PageShell>
  );
}
