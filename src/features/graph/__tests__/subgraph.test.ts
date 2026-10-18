import { describe, expect, it } from "vitest";
import { applyGraphFilters, mergeSubgraphs } from "@/features/graph/subgraph";
import type { GraphEdge, GraphNode, Subgraph } from "@/api/types";

function node(id: string, type = "task"): GraphNode {
  return { id, type, label: id, properties: {}, isSampleData: false };
}

function edge(id: string, from: string, to: string, current = true): GraphEdge {
  return { id, type: "DEPENDS_ON", from, to, current, provenance: [], confidence: 1 };
}

function subgraph(nodes: GraphNode[], edges: GraphEdge[], truncated = false): Subgraph {
  return { nodes, edges, truncated };
}

describe("mergeSubgraphs", () => {
  it("de-duplicates nodes and edges shared by two expansions", () => {
    const merged = mergeSubgraphs([
      subgraph([node("a"), node("b")], [edge("e1", "a", "b")]),
      subgraph([node("b"), node("c")], [edge("e1", "a", "b"), edge("e2", "b", "c")]),
    ]);

    expect(merged.nodes.map((n) => n.id).sort()).toEqual(["a", "b", "c"]);
    expect(merged.edges.map((e) => e.id).sort()).toEqual(["e1", "e2"]);
  });

  it("skips parts that have not loaded yet", () => {
    const merged = mergeSubgraphs([undefined, subgraph([node("a")], []), undefined]);

    expect(merged.nodes).toHaveLength(1);
  });

  it("stays truncated if any part was truncated", () => {
    const merged = mergeSubgraphs([
      subgraph([node("a")], [], false),
      subgraph([node("b")], [], true),
    ]);

    expect(merged.truncated).toBe(true);
  });

  it("returns the shared empty subgraph when there is nothing to merge", () => {
    expect(mergeSubgraphs([undefined, undefined])).toEqual({
      nodes: [],
      edges: [],
      truncated: false,
    });
  });
});

describe("applyGraphFilters", () => {
  const base = subgraph(
    [node("p1", "project"), node("t1", "task"), node("e1", "employee")],
    [edge("edge-1", "p1", "t1"), edge("edge-2", "t1", "e1", false)],
  );

  it("returns the input untouched when nothing is filtered", () => {
    expect(applyGraphFilters(base, [], true)).toBe(base);
  });

  it("drops edges whose endpoints were filtered out", () => {
    const filtered = applyGraphFilters(base, ["project", "task"], true);

    expect(filtered.nodes.map((n) => n.id)).toEqual(["p1", "t1"]);
    // edge-2 pointed at the employee node, which is no longer visible.
    expect(filtered.edges.map((e) => e.id)).toEqual(["edge-1"]);
  });

  it("hides historical edges when they are switched off", () => {
    const filtered = applyGraphFilters(base, [], false);

    expect(filtered.nodes).toHaveLength(3);
    expect(filtered.edges.map((e) => e.id)).toEqual(["edge-1"]);
  });

  it("keeps historical edges when they are switched on", () => {
    const filtered = applyGraphFilters(base, ["project", "task", "employee"], true);

    expect(filtered.edges.map((e) => e.id)).toEqual(["edge-1", "edge-2"]);
  });
});
