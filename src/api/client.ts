/**
 * The single HTTP entry point to the Cerevia API.
 *
 * Every request in the app goes through `request()`: no component calls
 * `fetch` directly. It owns the base URL, the session cookie, the CSRF
 * header and the translation of failures into `ApiError`.
 */

import { ApiError, ERROR_CODES, networkError, toApiError } from "@/api/errors";

/**
 * Origin of the API, without the `/api/v1` prefix - endpoint paths carry it,
 * and so does the `streamUrl` the server hands back for assistant answers.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  params?: QueryParams;
  /** JSON-serialized automatically; pass `FormData` to send multipart. */
  body?: unknown;
  /** Deduplicates retried mutations server-side (uploads, message sends). */
  idempotencyKey?: string;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/* ── CSRF token ────────────────────────────────────────────────────────── */

let csrfToken: string | null = null;

/** Called by the session provider whenever a session payload arrives. */
export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function getCsrfToken(): string | null {
  return csrfToken;
}

async function refreshCsrfToken(): Promise<string | null> {
  try {
    const { csrfToken: token } = await request<{ csrfToken: string }>("/api/v1/auth/csrf");
    csrfToken = token;
    return token;
  } catch {
    return null;
  }
}

/* ── Session expiry ────────────────────────────────────────────────────── */

type UnauthenticatedHandler = (error: ApiError) => void;

let onUnauthenticated: UnauthenticatedHandler | null = null;

/**
 * Registers the global 401 handler (redirect to login preserving the return
 * path). Returns an unsubscribe function.
 */
export function setUnauthenticatedHandler(handler: UnauthenticatedHandler | null): () => void {
  onUnauthenticated = handler;
  return () => {
    if (onUnauthenticated === handler) onUnauthenticated = null;
  };
}

/* ── Request ───────────────────────────────────────────────────────────── */

export function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      for (const entry of Array.isArray(value) ? value : [value]) {
        if (entry === undefined || entry === null || entry === "") continue;
        url.searchParams.append(key, String(entry));
      }
    }
  }
  return url.toString();
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, idempotencyKey, headers, method = "GET", ...rest } = options;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const send = async (csrf: string | null): Promise<Response> => {
    const requestHeaders = new Headers(headers);
    requestHeaders.set("Accept", "application/json");
    if (body !== undefined && !isForm) requestHeaders.set("Content-Type", "application/json");
    if (idempotencyKey) requestHeaders.set("Idempotency-Key", idempotencyKey);
    if (!SAFE_METHODS.has(method) && csrf) requestHeaders.set("X-CSRF-Token", csrf);

    return fetch(buildUrl(path, params), {
      ...rest,
      method,
      headers: requestHeaders,
      credentials: "include",
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  };

  const sentToken = csrfToken;
  let response: Response;
  try {
    response = await send(sentToken);
  } catch (cause) {
    throw networkError(cause);
  }

  // The server answers both a missing CSRF token and a missing permission
  // with 403, so the body decides. Retrying a permission denial would cost a
  // pointless round trip and tell the user nothing new.
  if (response.status === 403 && !SAFE_METHODS.has(method)) {
    const error = await toApiError(response);
    const isCsrfFailure = !sentToken || /csrf/i.test(error.detail) || /csrf/i.test(error.title);

    if (!isCsrfFailure) throw error;

    const refreshed = await refreshCsrfToken();
    if (!refreshed) throw error;

    try {
      response = await send(refreshed);
    } catch (cause) {
      throw networkError(cause);
    }
  }

  if (!response.ok) {
    const error = await toApiError(response);
    if (error.isUnauthenticated) {
      csrfToken = null;
      onUnauthenticated?.(error);
    }
    throw error;
  }

  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new ApiError({
      status: response.status,
      code: ERROR_CODES.network,
      title: "Malformed response",
      detail: `The API returned a response that could not be read as JSON: ${
        cause instanceof Error ? cause.message : "unknown error"
      }`,
    });
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
