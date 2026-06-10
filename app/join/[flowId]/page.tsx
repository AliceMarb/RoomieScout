import FlowNotFound from "@/components/FlowNotFound";
import JoinIntro from "@/components/JoinIntro";
import { getPairing } from "@/concepts/pairing";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;
  const flow = await getPairing(flowId);

  if (!flow) {
    return (
      <FlowNotFound
        title="Invite link not found"
        message="This invite doesn't exist or has expired. Ask your roommate to send you a fresh link."
      />
    );
  }

  return (
    <JoinIntro flowId={flowId} initiatorPersona={flow.initiatorPersona} initiatorEmail={flow.initiatorEmail} />
  );
}
