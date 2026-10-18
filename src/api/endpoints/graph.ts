import { api } from "@/api/client";
import type {
  EntityHistory,
  EntityRef,
  GraphEdge,
  GraphEntity,
  GraphPathsResult,
  GraphSchema,
  NeighborsParams,
  Page,
  Subgraph,
} from "@/api/types";

export function searchEntities(q: string, types?: string[]): Promise<Page<EntityRef>> {
  return api.get<Page<EntityRef>>("/api/v1/graph/search", {
    params: { q, types: types?.length ? types.join(",") : undefined },
  });
}

export function getGraphSchema(): Promise<GraphSchema> {
  return api.get<GraphSchema>("/api/v1/graph/schema");
}

export function getEntity(id: string): Promise<GraphEntity> {
  return api.get<GraphEntity>(`/api/v1/graph/entities/${encodeURIComponent(id)}`);
}

export function getNeighbors(id: string, params: NeighborsParams = {}): Promise<Subgraph> {
  const { edgeTypes, ...rest } = params;
  return api.get<Subgraph>(`/api/v1/graph/entities/${encodeURIComponent(id)}/neighbors`, {
    params: { ...rest, edgeTypes: edgeTypes?.length ? edgeTypes.join(",") : undefined },
  });
}

export function getPaths(from: string, to: string, maxHops?: number): Promise<GraphPathsResult> {
  return api.get<GraphPathsResult>("/api/v1/graph/paths", { params: { from, to, maxHops } });
}

export function getEdge(id: string): Promise<GraphEdge> {
  return api.get<GraphEdge>(`/api/v1/graph/edges/${encodeURIComponent(id)}`);
}

export function getEntityHistory(id: string): Promise<EntityHistory> {
  return api.get<EntityHistory>(`/api/v1/graph/entities/${encodeURIComponent(id)}/history`);
}
