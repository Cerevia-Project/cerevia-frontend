import { SourceDetailView } from "@/features/sources";

export const dynamic = "force-dynamic";

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <SourceDetailView jobId={jobId} />;
}
