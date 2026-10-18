import * as React from "react";
import { AssistantView } from "@/features/assistant";

export const instant = false;

async function ConversationContent({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <AssistantView conversationId={conversationId} />;
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  return (
    <React.Suspense fallback={<div className="h-32 rounded-md bg-secondary animate-pulse" />}>
      <ConversationContent params={params} />
    </React.Suspense>
  );
}
