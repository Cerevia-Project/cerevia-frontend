import { TeamDetailView } from "@/features/teams";

export const dynamic = "force-dynamic";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamDetailView teamId={teamId} />;
}
