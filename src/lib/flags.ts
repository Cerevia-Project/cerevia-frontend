/** Build-time flags. */

export function isDevTraceEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

export const MAX_GRAPH_NODES = 300;

export const DEFAULT_GRAPH_DEPTH = 1;
export const DEFAULT_GRAPH_LIMIT = 50;
