import { ProjectDetailView } from "@/features/projects";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDetailView projectId={projectId} />;
}
