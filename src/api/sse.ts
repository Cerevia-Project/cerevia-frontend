/**
 * Server-Sent Events over `fetch` + `ReadableStream`.
 *
 * `EventSource` cannot send a `Last-Event-ID` header on reconnect and cannot
 * carry our headers, so the parser is hand-rolled. It is tolerant by design:
 * a malformed frame is skipped rather than ending the stream, and the caller
 * decides what to do when the connection drops for good.
 */

import { API_BASE_URL } from "@/api/client";
import { ApiError, networkError, toApiError } from "@/api/errors";
import type { IngestionEvent, StreamEvent } from "@/api/types";

export interface SseMessage {
  /** `id:` field, echoed back as `Last-Event-ID` when reconnecting. */
  id?: string;
  /** `event:` field; absent for the default `message` type. */
  event?: string;
  data: string;
}

export interface StreamHandlers<T> {
  onEvent: (event: T, raw: SseMessage) => void;
  /** Transport or server failure. Called once per failed attempt. */
  onError?: (error: ApiError) => void;
  /** The stream ended cleanly, or reconnection was given up on. */
  onClose?: (reason: "complete" | "aborted" | "failed") => void;
  /**
   * A reconnect attempt is about to be made, 1-based. `canResume` is false
   * when no event id was seen, meaning the server cannot pick up where it
   * left off and will replay the response from the beginning - the consumer
   * must discard what it has accumulated so far.
   */
  onReconnect?: (attempt: number, canResume: boolean) => void;
  signal?: AbortSignal;
  /** Reconnect attempts after an interrupted stream. Default 3; 0 disables. */
  maxRetries?: number;
}

/* ── Frame parsing ─────────────────────────────────────────────────────── */

/**
 * Splits a byte stream into SSE messages. Handles frames split across chunk
 * boundaries, CRLF and LF line endings, multi-line `data:` and comments.
 */
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
      // Frames are separated by a blank line; normalize CRLF first.
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

    // A server that ends without a trailing blank line still sent a frame.
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
    // A single leading space after the colon is part of the framing, not data.
    const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");

    if (field === "data") dataLines.push(value);
    else if (field === "id") id = value;
    else if (field === "event") event = value;
  }

  if (dataLines.length === 0) return null;
  return { id, event, data: dataLines.join("\n") };
}

/* ── Connection ────────────────────────────────────────────────────────── */

/**
 * Opens an event stream and delivers parsed JSON events. Returns a function
 * that closes the stream.
 *
 * Reconnects with `Last-Event-ID` when the connection drops mid-stream, with
 * exponential backoff, up to `maxRetries`.
 */
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
          // A rejected or missing session will not recover by retrying.
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

/** Malformed frames are dropped: one bad event must not kill the answer. */
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

/* ── Typed streams ─────────────────────────────────────────────────────── */

/** Assistant answer events for a message (`streamUrl` from `POST …/messages`). */
export function streamAssistantAnswer(
  url: string,
  handlers: StreamHandlers<StreamEvent>,
): () => void {
  return openEventStream<StreamEvent>(url, handlers);
}

/** Ingestion progress events. Polling the job is the supported baseline. */
export function streamIngestionEvents(
  url: string,
  handlers: StreamHandlers<IngestionEvent>,
): () => void {
  return openEventStream<IngestionEvent>(url, handlers);
}
