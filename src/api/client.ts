/** Single HTTP entry point: base URL, session cookie, CSRF header and error mapping. */

import { ApiError, ERROR_CODES, networkError, toApiError } from "@/api/errors";

// Origin only: endpoint paths and the server's `streamUrl` carry `/api/v1`.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  params?: QueryParams;
  body?: unknown;
  idempotencyKey?: string;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

let csrfToken: string | null = null;

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

type UnauthenticatedHandler = (error: ApiError) => void;

let onUnauthenticated: UnauthenticatedHandler | null = null;

export function setUnauthenticatedHandler(handler: UnauthenticatedHandler | null): () => void {
  onUnauthenticated = handler;
  return () => {
    if (onUnauthenticated === handler) onUnauthenticated = null;
  };
}

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

  // A 403 is either a stale CSRF token or a missing permission; only the former is retried.
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
