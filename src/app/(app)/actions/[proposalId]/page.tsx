import { ActionDetailView } from "@/features/actions";

export default async function ActionDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  return <ActionDetailView proposalId={proposalId} />;
}
