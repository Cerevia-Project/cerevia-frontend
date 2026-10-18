/**
 * Build-time feature flags.
 *
 * Nothing here branches on "mock vs real" - the API base URL decides that.
 * These gate UI that only makes sense in some builds.
 */

/** Developer trace drawer (`GET /messages/{id}/trace`), dev builds only. */
export function isDevTraceEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * Hard client-side ceiling on rendered graph nodes. Past this the canvas
 * stops being readable, so the UI asks for a filter instead.
 */
export const MAX_GRAPH_NODES = 300;

/** Default neighborhood expansion: depth 1, never the whole organization. */
export const DEFAULT_GRAPH_DEPTH = 1;
export const DEFAULT_GRAPH_LIMIT = 50;
