import * as React from "react";
import { DecisionDetailView } from "@/features/decisions";

export const instant = false;

async function DecisionDetailContent({
  params,
}: {
  params: Promise<{ decisionId: string }>;
}) {
  const { decisionId } = await params;
  return <DecisionDetailView decisionId={decisionId} />;
}

export default function DecisionDetailPage({
  params,
}: {
  params: Promise<{ decisionId: string }>;
}) {
  return (
    <React.Suspense fallback={<div className="h-32 rounded-md bg-secondary animate-pulse" />}>
      <DecisionDetailContent params={params} />
    </React.Suspense>
  );
}
