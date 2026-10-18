/** SSE over fetch: `EventSource` cannot send `Last-Event-ID` or custom headers. */

import { API_BASE_URL } from "@/api/client";
import { ApiError, networkError, toApiError } from "@/api/errors";
import type { IngestionEvent, StreamEvent } from "@/api/types";

export interface SseMessage {
  id?: string;
  event?: string;
  data: string;
}

export interface StreamHandlers<T> {
  onEvent: (event: T, raw: SseMessage) => void;
  onError?: (error: ApiError) => void;
  onClose?: (reason: "complete" | "aborted" | "failed") => void;
  /** `canResume` is false when no event id was seen, so the server replays from the start. */
  onReconnect?: (attempt: number, canResume: boolean) => void;
  signal?: AbortSignal;
  maxRetries?: number;
}

export async function* parseSseStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseMessage> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const message = parseFrame(frame);
        if (message) yield message;
        boundary = buffer.indexOf("\n\n");
      }
    }

    const tail = parseFrame(buffer.replace(/\r\n/g, "\n"));
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}

function parseFrame(frame: string): SseMessage | null {
  const dataLines: string[] = [];
  let id: string | undefined;
  let event: string | undefined;

  for (const line of frame.split("\n")) {
    if (line === "" || line.startsWith(":")) continue; // keep-alive comment
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");

    if (field === "data") dataLines.push(value);
    else if (field === "id") id = value;
    else if (field === "event") event = value;
  }

  if (dataLines.length === 0) return null;
  return { id, event, data: dataLines.join("\n") };
}

export function openEventStream<T>(url: string, handlers: StreamHandlers<T>): () => void {
  const { onEvent, onError, onClose, onReconnect, signal, maxRetries = 3 } = handlers;
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });

  let lastEventId: string | undefined;
  let completed = false;

  const run = async () => {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      if (controller.signal.aborted) break;
      if (attempt > 0) {
        onReconnect?.(attempt, Boolean(lastEventId));
        await delay(Math.min(500 * 2 ** (attempt - 1), 4000), controller.signal);
        if (controller.signal.aborted) break;
      }

      try {
        const headers = new Headers({ Accept: "text/event-stream" });
        if (lastEventId) headers.set("Last-Event-ID", lastEventId);

        const response = await fetch(url.startsWith("http") ? url : `${API_BASE_URL}${url}`, {
          headers,
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = await toApiError(response);
          onError?.(error);
          if (!error.isRetryable) {
            onClose?.("failed");
            return;
          }
          continue;
        }

        if (!response.body) {
          onError?.(networkError(new Error("The event stream returned no body.")));
          continue;
        }

        for await (const message of parseSseStream(response.body)) {
          if (message.id) lastEventId = message.id;
          const parsed = safeParse<T>(message.data);
          if (parsed !== undefined) onEvent(parsed, message);
        }

        completed = true;
        onClose?.("complete");
        return;
      } catch (cause) {
        if (controller.signal.aborted) break;
        onError?.(cause instanceof ApiError ? cause : networkError(cause));
      }
    }

    if (!completed) onClose?.(controller.signal.aborted ? "aborted" : "failed");
  };

  void run();

  return () => {
    signal?.removeEventListener("abort", abort);
    controller.abort();
  };
}

function safeParse<T>(data: string): T | undefined {
  if (data === "" || data === "[DONE]") return undefined;
  try {
    return JSON.parse(data) as T;
  } catch {
    return undefined;
  }
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

export function streamAssistantAnswer(
  url: string,
  handlers: StreamHandlers<StreamEvent>,
): () => void {
  return openEventStream<StreamEvent>(url, handlers);
}

export function streamIngestionEvents(
  url: string,
  handlers: StreamHandlers<IngestionEvent>,
): () => void {
  return openEventStream<IngestionEvent>(url, handlers);
}
