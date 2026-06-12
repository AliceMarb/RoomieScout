import { getPairing } from "@/concepts/pairing";
import FlowNotFound from "@/components/FlowNotFound";
import PracticalForm from "@/components/PracticalForm";

export default async function PaidPage({
  params,
  searchParams,
}: {
  params: Promise<{ flowId: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { flowId } = await params;
  const { role: roleParam } = await searchParams;
  const pairing = await getPairing(flowId);

  if (!pairing) {
    return (
      <FlowNotFound
        title="Session not found"
        message="This link has expired or doesn't exist. Start a new quiz to get your Housemate Type."
      />
    );
  }

  const role: "initiator" | "roommate" = roleParam === "roommate" ? "roommate" : "initiator";
  return <PracticalForm flowId={flowId} role={role} />;
}
