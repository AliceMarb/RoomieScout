import FlowNotFound from "@/components/FlowNotFound";
import JoinForm from "@/components/JoinForm";
import { Card, PageShell, Wordmark } from "@/components/ui";
import { getFlow } from "@/lib/store";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;
  const flow = getFlow(flowId);

  if (!flow) {
    return (
      <FlowNotFound
        title="Invite link not found"
        message="This invite doesn't exist or has expired. Ask your roommate to send you a fresh link."
      />
    );
  }

  return (
    <PageShell>
      <Wordmark />
      <header className="mt-8">
        <span className="eyebrow">You&apos;re invited</span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          Are you two great roommates?
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-soft">
          Chat with our AI for a minute — we&apos;ll figure out your Housemate Type and
          see how well you match.
        </p>
      </header>

      <div className="mt-8">
        <Card className="p-6">
          <JoinForm flowId={flowId} />
        </Card>
      </div>
    </PageShell>
  );
}
