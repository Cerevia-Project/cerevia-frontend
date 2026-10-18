"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationsApi } from "@/api/endpoints";
import { ApiError } from "@/api/errors";
import { queryKeys } from "@/api/query-keys";
import { streamAssistantAnswer } from "@/api/sse";
import type {
  AnswerStatus,
  AssistantMessage,
  Citation,
  Claim,
  Conflict,
  EntityRef,
  GraphPath,
  PageParams,
  StreamEvent,
  StreamStage,
  Subgraph,
  SuggestedAction,
} from "@/api/types";
import { isDevTraceEnabled } from "@/lib/flags";

export function useConversations(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.conversations.list(params),
    queryFn: () => conversationsApi.listConversations(params),
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: queryKeys.conversations.detail(id ?? ""),
    queryFn: () => conversationsApi.getConversation(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title?: string; scope?: { projectId?: string } } = {}) =>
      conversationsApi.createConversation(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conversationsApi.deleteConversation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}

export function useEvidence(messageId: string | null) {
  return useQuery({
    queryKey: queryKeys.conversations.evidence(messageId ?? ""),
    queryFn: () => conversationsApi.getEvidence(messageId as string),
    enabled: Boolean(messageId),
  });
}

export function useRetrievalTrace(messageId: string | null) {
  return useQuery({
    queryKey: queryKeys.conversations.trace(messageId ?? ""),
    queryFn: () => conversationsApi.getRetrievalTrace(messageId as string),
    enabled: Boolean(messageId) && isDevTraceEnabled(),
    retry: false,
  });
}

export function useMessageFeedback(messageId: string) {
  return useMutation({
    mutationFn: ({ rating, reason }: { rating: "up" | "down"; reason?: string }) =>
      conversationsApi.sendFeedback(messageId, rating, reason),
  });
}

export type AnswerPhase = "idle" | "sending" | "streaming" | "complete" | "error";

export interface StreamedAnswer {
  messageId: string | null;
  question: string;
  text: string;
  claims: Claim[];
  citations: Citation[];
  paths: GraphPath[];
  conflicts: Conflict[];
  subgraph?: Subgraph;
  followUps: string[];
  relatedEntities: EntityRef[];
  actions: SuggestedAction[];
  stage?: StreamStage;
  answerStatus?: AnswerStatus;
  accessLimited: boolean;
  phase: AnswerPhase;
  error?: ApiError;
  reconnectAttempt: number;
}

const emptyAnswer: StreamedAnswer = {
  messageId: null,
  question: "",
  text: "",
  claims: [],
  citations: [],
  paths: [],
  conflicts: [],
  followUps: [],
  relatedEntities: [],
  actions: [],
  accessLimited: false,
  phase: "idle",
  reconnectAttempt: 0,
};

export const STAGE_LABELS: Record<StreamStage, string> = {
  understanding: "Understanding the question…",
  retrieving: "Searching documents…",
  traversing: "Tracing relationships…",
  checking_access: "Checking access…",
  writing: "Writing the answer…",
};

export function useAssistantStream() {
  const queryClient = useQueryClient();
  const [answer, setAnswer] = React.useState<StreamedAnswer>(emptyAnswer);
  const closeRef = React.useRef<(() => void) | null>(null);
  // Deltas arrive faster than the screen paints, so they are flushed once per frame.
  const pendingTextRef = React.useRef("");
  const frameRef = React.useRef<number | null>(null);

  const flushText = React.useCallback(() => {
    frameRef.current = null;
    const pending = pendingTextRef.current;
    if (!pending) return;
    pendingTextRef.current = "";
    setAnswer((current) => ({ ...current, text: current.text + pending }));
  }, []);

  const queueText = React.useCallback(
    (delta: string) => {
      pendingTextRef.current += delta;
      if (frameRef.current !== null) return;
      frameRef.current =
        typeof requestAnimationFrame === "function"
          ? requestAnimationFrame(flushText)
          : (setTimeout(flushText, 16) as unknown as number);
    },
    [flushText],
  );

  React.useEffect(
    () => () => {
      closeRef.current?.();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const applyEvent = React.useCallback(
    (event: StreamEvent) => {
      switch (event.type) {
        case "status":
          setAnswer((c) => ({ ...c, stage: event.stage ?? c.stage }));
          break;
        case "text_delta":
          if (event.text) queueText(event.text);
          break;
        case "claim":
          if (event.claim) setAnswer((c) => ({ ...c, claims: [...c.claims, event.claim!] }));
          break;
        case "citation":
          if (event.citation)
            setAnswer((c) => ({ ...c, citations: [...c.citations, event.citation!] }));
          break;
        case "path":
          if (event.path)
            setAnswer((c) => ({
              ...c,
              paths: [...c.paths, event.path!],
              subgraph: event.subgraph ?? c.subgraph,
            }));
          break;
        case "conflict":
          if (event.conflict)
            setAnswer((c) => ({ ...c, conflicts: [...c.conflicts, event.conflict!] }));
          break;
        case "follow_ups":
          setAnswer((c) => ({
            ...c,
            followUps: event.suggestions ?? c.followUps,
            relatedEntities: event.relatedEntities ?? c.relatedEntities,
          }));
          break;
        case "actions":
          setAnswer((c) => ({ ...c, actions: event.actions ?? c.actions }));
          break;
        case "done":
          flushText();
          setAnswer((c) => ({
            ...c,
            phase: "complete",
            stage: undefined,
            messageId: event.messageId ?? c.messageId,
            answerStatus: event.answerStatus ?? c.answerStatus ?? "answered",
            accessLimited: event.accessLimited ?? c.accessLimited,
          }));
          break;
        case "error":
          flushText();
          setAnswer((c) => ({
            ...c,
            phase: "error",
            stage: undefined,
            error: new ApiError({
              status: 502,
              code: event.code ?? "AI_UNAVAILABLE",
              detail: event.detail ?? "The assistant could not finish this answer.",
            }),
          }));
          break;
        default:
          break;
      }
    },
    [flushText, queueText],
  );

  // When the stream cannot be finished, fall back to the stored answer.
  const loadStoredAnswer = React.useCallback(
    async (conversationId: string, messageId: string) => {
      try {
        const stored: AssistantMessage = await conversationsApi.getAssistantMessage(
          conversationId,
          messageId,
        );
        setAnswer((c) => ({
          ...c,
          phase: "complete",
          stage: undefined,
          error: undefined,
          text: stored.text ?? c.text,
          claims: stored.claims ?? c.claims,
          citations: stored.citations ?? c.citations,
          paths: stored.paths ?? c.paths,
          conflicts: stored.conflicts ?? c.conflicts,
          subgraph: stored.subgraph ?? c.subgraph,
          followUps: stored.followUps ?? c.followUps,
          relatedEntities: stored.relatedEntities ?? c.relatedEntities,
          answerStatus: stored.answerStatus ?? c.answerStatus,
          accessLimited: stored.accessLimited ?? c.accessLimited,
        }));
      } catch (error) {
        setAnswer((c) => ({
          ...c,
          phase: "error",
          error: error instanceof ApiError ? error : c.error,
        }));
      }
    },
    [],
  );

  const ask = React.useCallback(
    async (conversationId: string, text: string) => {
      closeRef.current?.();
      pendingTextRef.current = "";
      setAnswer({ ...emptyAnswer, question: text, phase: "sending" });

      let messageId: string;
      let url: string;
      try {
        const accepted = await conversationsApi.sendMessage(
          conversationId,
          text,
          crypto.randomUUID(),
        );
        messageId = accepted.messageId;
        url = conversationsApi.streamUrl(accepted.streamUrl);
      } catch (error) {
        setAnswer((c) => ({
          ...c,
          phase: "error",
          error: error instanceof ApiError ? error : undefined,
        }));
        return;
      }

      setAnswer((c) => ({ ...c, messageId, phase: "streaming" }));

      closeRef.current = streamAssistantAnswer(url, {
        onEvent: applyEvent,
        onReconnect: (attempt, canResume) =>
          setAnswer((current) => {
            // Without an event id the server replays from the start, so drop what was rendered.
            if (canResume) return { ...current, reconnectAttempt: attempt };
            pendingTextRef.current = "";
            return {
              ...current,
              reconnectAttempt: attempt,
              text: "",
              claims: [],
              citations: [],
              paths: [],
              conflicts: [],
              followUps: [],
              relatedEntities: [],
              actions: [],
              subgraph: undefined,
              answerStatus: undefined,
              accessLimited: false,
            };
          }),
        onError: (error) => setAnswer((c) => ({ ...c, error })),
        onClose: (reason) => {
          flushText();
          if (reason === "failed") {
            void loadStoredAnswer(conversationId, messageId);
          } else if (reason === "complete") {
            setAnswer((c) => (c.phase === "streaming" ? { ...c, phase: "complete" } : c));
          }
          void queryClient.invalidateQueries({
            queryKey: queryKeys.conversations.detail(conversationId),
          });
          void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
        },
      });
    },
    [applyEvent, flushText, loadStoredAnswer, queryClient],
  );

  const stop = React.useCallback(() => {
    closeRef.current?.();
    closeRef.current = null;
    flushText();
    setAnswer((c) => (c.phase === "streaming" ? { ...c, phase: "complete", stage: undefined } : c));
  }, [flushText]);

  const reset = React.useCallback(() => {
    closeRef.current?.();
    closeRef.current = null;
    pendingTextRef.current = "";
    setAnswer(emptyAnswer);
  }, []);

  return { answer, ask, stop, reset, isBusy: answer.phase === "sending" || answer.phase === "streaming" };
}
