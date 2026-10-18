/** Assistant conversations, messages and evidence. */

import { api, API_BASE_URL } from "@/api/client";
import type {
  AssistantMessage,
  Conversation,
  ConversationDetail,
  EvidenceBundle,
  Page,
  PageParams,
  RetrievalTrace,
  SendMessageResult,
} from "@/api/types";

export function listConversations(params: PageParams = {}): Promise<Page<Conversation>> {
  return api.get<Page<Conversation>>("/api/v1/conversations", { params: { ...params } });
}

export function createConversation(body: {
  title?: string;
  scope?: { projectId?: string };
} = {}): Promise<Conversation> {
  return api.post<Conversation>("/api/v1/conversations", body);
}

export function getConversation(id: string): Promise<ConversationDetail> {
  return api.get<ConversationDetail>(`/api/v1/conversations/${encodeURIComponent(id)}`);
}

export function deleteConversation(id: string): Promise<void> {
  return api.delete<void>(`/api/v1/conversations/${encodeURIComponent(id)}`);
}

/**
 * Sends a question. The answer is not in this response: it returns the id of
 * the assistant message and the URL of its event stream.
 */
export function sendMessage(
  conversationId: string,
  text: string,
  idempotencyKey?: string,
): Promise<SendMessageResult> {
  return api.post<SendMessageResult>(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
    { text },
    { idempotencyKey },
  );
}

/** Absolute URL for a `streamUrl` the server returned as a root-relative path. */
export function streamUrl(relativeOrAbsolute: string): string {
  return relativeOrAbsolute.startsWith("http")
    ? relativeOrAbsolute
    : `${API_BASE_URL}${relativeOrAbsolute}`;
}

/** Stored answer - the fallback when the stream drops or is never opened. */
export function getAssistantMessage(
  conversationId: string,
  messageId: string,
): Promise<AssistantMessage> {
  return api.get<AssistantMessage>(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
  );
}

export function getEvidence(messageId: string): Promise<EvidenceBundle> {
  return api.get<EvidenceBundle>(`/api/v1/messages/${encodeURIComponent(messageId)}/evidence`);
}

export function sendFeedback(
  messageId: string,
  rating: "up" | "down",
  reason?: string,
): Promise<void> {
  return api.post<void>(`/api/v1/messages/${encodeURIComponent(messageId)}/feedback`, {
    rating,
    reason,
  });
}

/** Development-only retrieval trace. */
export function getRetrievalTrace(messageId: string): Promise<RetrievalTrace> {
  return api.get<RetrievalTrace>(`/api/v1/messages/${encodeURIComponent(messageId)}/trace`);
}
