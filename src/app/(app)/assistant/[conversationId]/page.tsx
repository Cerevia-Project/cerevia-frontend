import { AssistantView } from "@/features/assistant";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <AssistantView conversationId={conversationId} />;
}
