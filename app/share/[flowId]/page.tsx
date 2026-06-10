import FlowNotFound from "@/components/FlowNotFound";
import ShareResult from "@/components/ShareResult";
import { Card, PageShell, Wordmark } from "@/components/ui";
import { getPairing } from "@/concepts/pairing";

export default async function SharePage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;
  const flow = await getPairing(flowId);

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
      <header className="mt-10">
        <span className="eyebrow">Your result</span>
      </header>
      <div className="mt-6">
        <Card className="p-8">
          <ShareResult flowId={flowId} persona={flow.initiatorPersona} />
        </Card>
      </div>
    </PageShell>
  );
}
