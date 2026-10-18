import * as React from "react";
import { SourceDetailView } from "@/features/sources";

// Behind the session guard in the layout above: there is no prerenderable
// shell until `GET /auth/session` resolves, so instant-navigation
// validation does not apply to this segment.
export const instant = false;

async function SourceDetailContent({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <SourceDetailView jobId={jobId} />;
}

export default function SourceDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  return (
    <React.Suspense fallback={<div className="h-32 rounded-md bg-secondary animate-pulse" />}>
      <SourceDetailContent params={params} />
    </React.Suspense>
  );
}
