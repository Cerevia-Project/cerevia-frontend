import { PersonDetailView } from "@/features/people";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  return <PersonDetailView personId={personId} />;
}
