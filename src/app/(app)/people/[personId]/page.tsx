import { PersonDetailView } from "@/features/people";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  return <PersonDetailView personId={personId} />;
}
