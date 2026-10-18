import * as React from "react";
import { ActionDetailView } from "@/features/actions";

// Behind the session guard in the layout above: there is no prerenderable
// shell until `GET /auth/session` resolves, so instant-navigation
// validation does not apply to this segment.
export const instant = false;

async function ActionDetailContent({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  return <ActionDetailView proposalId={proposalId} />;
}

export default function ActionDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  return (
    <React.Suspense fallback={<div className="h-32 rounded-md bg-secondary animate-pulse" />}>
      <ActionDetailContent params={params} />
    </React.Suspense>
  );
}
