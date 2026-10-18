import type { GraphEdge, GraphNode, Subgraph } from "@/api/types";

export const EMPTY_SUBGRAPH: Subgraph = { nodes: [], edges: [], truncated: false };

export function mergeSubgraphs(parts: (Subgraph | undefined)[]): Subgraph {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  let truncated = false;

  for (const part of parts) {
    if (!part) continue;
    for (const node of part.nodes) nodes.set(node.id, node);
    for (const edge of part.edges) edges.set(edge.id, edge);
    truncated = truncated || part.truncated;
  }

  if (nodes.size === 0 && edges.size === 0) return EMPTY_SUBGRAPH;
  return { nodes: [...nodes.values()], edges: [...edges.values()], truncated };
}

export function applyGraphFilters(
  subgraph: Subgraph,
  entityTypes: string[],
  showHistorical: boolean,
): Subgraph {
  if (entityTypes.length === 0 && showHistorical) return subgraph;

  const nodes =
    entityTypes.length === 0
      ? subgraph.nodes
      : subgraph.nodes.filter((node) => entityTypes.includes(node.type));
  const visibleIds = new Set(nodes.map((node) => node.id));

  const edges = subgraph.edges.filter(
    (edge) =>
      visibleIds.has(edge.from) && visibleIds.has(edge.to) && (showHistorical || edge.current),
  );

  return { nodes, edges, truncated: subgraph.truncated };
}
