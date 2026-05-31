import FlowNotFound from "@/components/FlowNotFound";
import JoinIntro from "@/components/JoinIntro";
import { PageShell, Wordmark } from "@/components/ui";
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
      <div className="mt-10">
        <JoinIntro flowId={flowId} initiatorPersona={flow.initiatorPersona} initiatorEmail={flow.initiatorEmail} />
      </div>
    </PageShell>
  );
}
