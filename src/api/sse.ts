/**
 * Server-Sent Events (SSE) Client
 */

export interface SseOptions<T> {
  url: string;
  onMessage: (data: T) => void;
  onError?: (error: Event) => void;
  onComplete?: () => void;
}

export function subscribeToSse<T>({
  url,
  onMessage,
  onError,
  onComplete,
}: SseOptions<T>): () => void {
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      if (event.data === "[DONE]") {
        onComplete?.();
        eventSource.close();
        return;
      }
      const parsed = JSON.parse(event.data) as T;
      onMessage(parsed);
    } catch {
      onMessage(event.data as unknown as T);
    }
  };

  eventSource.onerror = (err) => {
    onError?.(err);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}
