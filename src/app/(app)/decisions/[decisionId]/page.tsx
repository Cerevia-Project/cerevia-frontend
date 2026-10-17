import { DecisionDetailView } from "@/features/decisions";

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ decisionId: string }>;
}) {
  const { decisionId } = await params;
  return <DecisionDetailView decisionId={decisionId} />;
}
