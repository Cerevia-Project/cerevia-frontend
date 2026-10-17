import { DecisionDetailView } from "@/features/decisions";

export const dynamic = "force-dynamic";

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ decisionId: string }>;
}) {
  const { decisionId } = await params;
  return <DecisionDetailView decisionId={decisionId} />;
}
