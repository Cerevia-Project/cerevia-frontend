import * as React from "react";
import { PersonDetailView } from "@/features/people";

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
