/**
 * Centralized API error mapping and normalization
 */

export class CereviaApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, code = "UNKNOWN_ERROR", status = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = "CereviaApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function mapHttpError(status: number, message?: string): CereviaApiError {
  switch (status) {
    case 400:
      return new CereviaApiError(message || "Invalid request parameters.", "BAD_REQUEST", 400);
    case 401:
      return new CereviaApiError("Authentication session expired. Please sign in again.", "UNAUTHORIZED", 401);
    case 403:
      return new CereviaApiError("Access restricted. You lack permission for this knowledge resource.", "FORBIDDEN", 403);
    case 404:
      return new CereviaApiError("Requested knowledge node or document was not found.", "NOT_FOUND", 404);
    case 503:
    case 504:
      return new CereviaApiError("FalkorDB knowledge graph is currently re-indexing. Please retry.", "SERVICE_UNAVAILABLE", status);
    default:
      return new CereviaApiError(message || "An unexpected error occurred while communicating with Cerevia backend.", "SERVER_ERROR", status);
  }
}
