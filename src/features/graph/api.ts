"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { graphApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { NeighborsParams, Subgraph } from "@/api/types";
import { mergeSubgraphs } from "@/features/graph/subgraph";

/** Entity/edge display metadata. The UI follows the backend's schema. */
export function useGraphSchema() {
  return useQuery({
    queryKey: queryKeys.graph.schema,
    queryFn: graphApi.getGraphSchema,
    staleTime: 10 * 60_000,
  });
}

export function useEntitySearch(query: string, types?: string[]) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: queryKeys.graph.search(trimmed, types),
    queryFn: () => graphApi.searchEntities(trimmed, types),
    enabled: trimmed.length > 1,
  });
}

export function useEntity(id: string | null) {
  return useQuery({
    queryKey: queryKeys.graph.entity(id ?? ""),
    queryFn: () => graphApi.getEntity(id as string),
    enabled: Boolean(id),
  });
}

export function useNeighbors(id: string | null, params: NeighborsParams = {}) {
  return useQuery({
    queryKey: queryKeys.graph.neighbors(id ?? "", params),
    queryFn: () => graphApi.getNeighbors(id as string, params),
    enabled: Boolean(id),
  });
}

/**
 * Neighbourhoods for several entities at once, merged into one subgraph.
 *
 * `useQueries` keeps the hook count stable as the expansion list grows, and
 * `combine` memoizes the merge so the canvas is not handed a new subgraph -
 * and made to re-run its layout - on every render.
 */
export function useNeighborsBatch(ids: string[], params: NeighborsParams = {}): Subgraph {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.graph.neighbors(id, params),
      queryFn: () => graphApi.getNeighbors(id, params),
    })),
    combine: (results) => mergeSubgraphs(results.map((result) => result.data)),
  });
}

export function useEdge(id: string | null) {
  return useQuery({
    queryKey: queryKeys.graph.edge(id ?? ""),
    queryFn: () => graphApi.getEdge(id as string),
    enabled: Boolean(id),
  });
}

export function useGraphPaths(from: string | null, to: string | null, maxHops?: number) {
  return useQuery({
    queryKey: queryKeys.graph.paths(from ?? "", to ?? "", maxHops),
    queryFn: () => graphApi.getPaths(from as string, to as string, maxHops),
    enabled: Boolean(from && to),
  });
}

export function useEntityHistory(id: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.graph.history(id ?? ""),
    queryFn: () => graphApi.getEntityHistory(id as string),
    enabled: Boolean(id) && enabled,
  });
}
