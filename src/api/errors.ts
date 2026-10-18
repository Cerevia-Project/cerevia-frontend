/**
 * Error mapping for the Cerevia API.
 *
 * The backend returns RFC 9457 problem details (`components/schemas/Error` in
 * the contract). Everything the UI shows about a failure is derived here, so
 * screens never have to interpret a status code themselves.
 */

import type { components } from "@/api/schema";

export type ProblemDetails = components["schemas"]["Error"];
export type FieldError = NonNullable<ProblemDetails["fieldErrors"]>[number];

/** Codes the UI branches on. Any other code falls through to the generic path. */
export const ERROR_CODES = {
  unauthenticated: "UNAUTHENTICATED",
  forbidden: "FORBIDDEN",
  notFound: "NOT_FOUND",
  validationFailed: "VALIDATION_FAILED",
  unsupportedFileType: "UNSUPPORTED_FILE_TYPE",
  fileTooLarge: "FILE_TOO_LARGE",
  rateLimited: "RATE_LIMITED",
  aiUnavailable: "AI_UNAVAILABLE",
  network: "NETWORK_FAILURE",
} as const;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string;
  readonly title: string;
  readonly requestId?: string;
  readonly fieldErrors: FieldError[];

  constructor(init: {
    status: number;
    code: string;
    title?: string;
    detail: string;
    requestId?: string;
    fieldErrors?: FieldError[];
  }) {
    super(init.detail);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.title = init.title ?? init.code;
    this.detail = init.detail;
    this.requestId = init.requestId;
    this.fieldErrors = init.fieldErrors ?? [];
  }

  get isUnauthenticated(): boolean {
    return this.status === 401 || this.code === ERROR_CODES.unauthenticated;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** Retrying the same request may succeed (transport or transient server fault). */
  get isRetryable(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500;
  }
}

/**
 * Build an ApiError from a non-2xx response. Falls back to a status-derived
 * message when the body is not problem details (proxies, gateways, HTML errors).
 */
export async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }

  const problem = isProblemDetails(body) ? body : undefined;
  const code = problem?.code ?? codeForStatus(response.status);

  return new ApiError({
    status: response.status,
    code,
    title: problem?.title,
    detail: problem?.detail ?? messageForCode(code, response.status),
    requestId: problem?.requestId,
    fieldErrors: problem?.fieldErrors,
  });
}

export function networkError(cause: unknown): ApiError {
  return new ApiError({
    status: 0,
    code: ERROR_CODES.network,
    title: "Network unavailable",
    detail:
      cause instanceof Error && cause.message
        ? `Could not reach the Cerevia API: ${cause.message}`
        : "Could not reach the Cerevia API.",
  });
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ProblemDetails).code === "string" &&
    typeof (value as ProblemDetails).status === "number"
  );
}

function codeForStatus(status: number): string {
  switch (status) {
    case 400:
      return ERROR_CODES.validationFailed;
    case 401:
      return ERROR_CODES.unauthenticated;
    case 403:
      return ERROR_CODES.forbidden;
    case 404:
      return ERROR_CODES.notFound;
    case 413:
      return ERROR_CODES.fileTooLarge;
    case 415:
      return ERROR_CODES.unsupportedFileType;
    case 429:
      return ERROR_CODES.rateLimited;
    default:
      return status >= 500 ? "SERVER_ERROR" : "REQUEST_FAILED";
  }
}

/** Human copy for codes the server did not describe itself. */
function messageForCode(code: string, status: number): string {
  switch (code) {
    case ERROR_CODES.unauthenticated:
      return "Your session has expired. Sign in to continue.";
    case ERROR_CODES.forbidden:
      return "You do not have access to this resource.";
    case ERROR_CODES.notFound:
      return "This record does not exist, or you do not have access to it.";
    case ERROR_CODES.validationFailed:
      return "The request was rejected as invalid.";
    case ERROR_CODES.unsupportedFileType:
      return "That file type is not supported.";
    case ERROR_CODES.fileTooLarge:
      return "That file is larger than the upload limit.";
    case ERROR_CODES.rateLimited:
      return "Too many requests. Wait a moment and try again.";
    case ERROR_CODES.aiUnavailable:
      return "The assistant is unavailable right now. The rest of the workspace still works.";
    default:
      return status >= 500
        ? "The Cerevia API failed to handle this request."
        : "The request could not be completed.";
  }
}

/** Short message for toasts and inline error states. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.detail;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

/** `requestId` for the expandable "Details" area shown to support. */
export function errorRequestId(error: unknown): string | undefined {
  return error instanceof ApiError ? error.requestId : undefined;
}

/** Field-level messages keyed by field name, for React Hook Form. */
export function fieldErrorMap(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(error.fieldErrors.map((f) => [f.field, f.message]));
}
