import * as React from "react";
import { ProjectDetailView } from "@/features/projects";

// Behind the session guard in the layout above: there is no prerenderable
// shell until `GET /auth/session` resolves, so instant-navigation
// validation does not apply to this segment.
export const instant = false;

async function ProjectDetailContent({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDetailView projectId={projectId} />;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  return (
    <React.Suspense fallback={<div className="h-32 rounded-md bg-secondary animate-pulse" />}>
      <ProjectDetailContent params={params} />
    </React.Suspense>
  );
}
