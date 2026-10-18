import * as React from "react";
import { PersonDetailView } from "@/features/people";

// Behind the session guard in the layout above: there is no prerenderable
// shell until `GET /auth/session` resolves, so instant-navigation
// validation does not apply to this segment.
export const instant = false;

async function PersonDetailContent({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  return <PersonDetailView personId={personId} />;
}

export default function PersonDetailPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  return (
    <React.Suspense fallback={<div className="h-32 rounded-md bg-secondary animate-pulse" />}>
      <PersonDetailContent params={params} />
    </React.Suspense>
  );
}
