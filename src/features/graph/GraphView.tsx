"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Network, Search, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  EdgeInspector,
  GraphCanvas,
  GraphControls,
  GraphLegend,
  GraphListView,
  NodeInspector,
  type GraphCanvasHandle,
  type GraphLayout,
} from "@/components/graph";
import { EmptyState, ErrorState } from "@/components/feedback";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntitySearch, useGraphSchema, useNeighbors, useNeighborsBatch } from "@/features/graph/api";
import { DEFAULT_GRAPH_DEPTH, DEFAULT_GRAPH_LIMIT, MAX_GRAPH_NODES } from "@/lib/flags";
import { errorMessage } from "@/api/errors";
import { applyGraphFilters, mergeSubgraphs } from "@/features/graph/subgraph";
import type { GraphEdge, GraphNode } from "@/api/types";

/**
 * Focused graph exploration.
 *
 * The explorer never renders the whole organization: it starts from one
 * entity and expands outwards on request. Selection, filters and the focus
 * entity all live in the URL, so any view can be shared as a link.
 */
export function GraphView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const focusId = searchParams.get("entity");
  const pathIds = React.useMemo(() => {
    const raw = searchParams.get("path");
    return raw ? new Set(raw.split(",").filter(Boolean)) : undefined;
  }, [searchParams]);
  const fromMessage = searchParams.get("fromMessage");
  const depthParam = Number(searchParams.get("depth"));
  const depth = Number.isFinite(depthParam) && depthParam >= 1 && depthParam <= 3
    ? depthParam
    : DEFAULT_GRAPH_DEPTH;

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [layout, setLayout] = React.useState<GraphLayout>("force");
  const [entityTypeFilter, setEntityTypeFilter] = React.useState<string[]>([]);
  const [edgeTypeFilter, setEdgeTypeFilter] = React.useState<string[]>([]);
  const [showHistorical, setShowHistorical] = React.useState(true);
  const [selectedNode, setSelectedNode] = React.useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = React.useState<GraphEdge | null>(null);
  /** Nodes the user expanded, merged into the focus neighbourhood. */
  const [expandedIds, setExpandedIds] = React.useState<string[]>([]);

  const canvasRef = React.useRef<GraphCanvasHandle>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const schema = useGraphSchema();
  const results = useEntitySearch(debouncedSearch);
  const neighbors = useNeighbors(focusId, {
    depth,
    limit: DEFAULT_GRAPH_LIMIT,
    edgeTypes: edgeTypeFilter.length > 0 ? edgeTypeFilter : undefined,
  });

  // Each expansion is its own request; the results are merged below.
  const expansions = useNeighborsBatch(expandedIds, {
    depth,
    limit: DEFAULT_GRAPH_LIMIT,
    edgeTypes: edgeTypeFilter.length > 0 ? edgeTypeFilter : undefined,
  });

  const colorKeys = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const entityType of schema.data?.entityTypes ?? []) {
      map[entityType.type] = entityType.colorKey;
    }
    return map;
  }, [schema.data]);

  const merged = React.useMemo(
    () => mergeSubgraphs([neighbors.data, expansions]),
    [neighbors.data, expansions],
  );

  const filtered = React.useMemo(
    () => applyGraphFilters(merged, entityTypeFilter, showHistorical),
    [merged, entityTypeFilter, showHistorical],
  );

  const overNodeCap = filtered.nodes.length > MAX_GRAPH_NODES;

  // Focusing a different entity is a navigation, so it goes into history and
  // the browser's back button walks back through the exploration.
  const focusEntity = (id: string) => {
    setExpandedIds([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set("entity", id);
    router.push(`/graph?${params.toString()}`);
  };

  // Changing depth re-scopes the same view, so it replaces rather than
  // filling history with filter adjustments.
  const setDepth = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("depth", String(next));
    router.replace(`/graph?${params.toString()}`);
  };

  const expandNode = (node: GraphNode) => {
    setExpandedIds((current) => (current.includes(node.id) ? current : [...current, node.id]));
  };

  const exportImage = () => {
    const dataUrl = canvasRef.current?.exportPng();
    if (!dataUrl) {
      toast.error("The graph is not ready to export yet.");
      return;
    }
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `cerevia-graph-${focusId ?? "view"}.png`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Knowledge graph explorer
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Start from an entity and expand outwards. Each relationship carries the source it came
            from.
          </p>
        </div>
        {fromMessage && (
          <p className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground">
            Opened from assistant message{" "}
            <span className="font-mono text-foreground">{fromMessage}</span>
          </p>
        )}
      </header>

      <GraphControls
        search={search}
        onSearchChange={setSearch}
        layout={layout}
        onLayoutChange={setLayout}
        depth={depth}
        onDepthChange={setDepth}
        entityTypes={schema.data?.entityTypes ?? []}
        selectedEntityTypes={entityTypeFilter}
        onEntityTypesChange={setEntityTypeFilter}
        edgeTypes={schema.data?.edgeTypes ?? []}
        selectedEdgeTypes={edgeTypeFilter}
        onEdgeTypesChange={setEdgeTypeFilter}
        showHistorical={showHistorical}
        onShowHistoricalChange={setShowHistorical}
        nodeCount={filtered.nodes.length}
        edgeCount={filtered.edges.length}
        truncated={filtered.truncated}
        onZoomIn={() => canvasRef.current?.zoomIn()}
        onZoomOut={() => canvasRef.current?.zoomOut()}
        onFit={() => canvasRef.current?.fit()}
        onExport={exportImage}
        disabled={!focusId}
      />

      {debouncedSearch.trim().length > 1 && (
        <SearchResults
          isPending={results.isPending}
          items={results.data?.items ?? []}
          onPick={(id) => {
            setSearch("");
            setDebouncedSearch("");
            focusEntity(id);
          }}
        />
      )}

      {!focusId ? (
        <EmptyState
          icon={<Search className="h-4 w-4" />}
          title="Search for an entity to begin"
          description="The explorer shows a focused neighbourhood rather than the whole organization. Pick a person, team, project or decision to start from."
        />
      ) : neighbors.isError ? (
        <ErrorState
          title="Could not load this neighbourhood"
          message={errorMessage(neighbors.error)}
          onRetry={() => void neighbors.refetch()}
          isRetrying={neighbors.isFetching}
        />
      ) : neighbors.isPending ? (
        <Skeleton className="h-[620px] w-full rounded-md" />
      ) : overNodeCap ? (
        <Card className="flex flex-col items-center justify-center gap-2 p-10 text-center">
          <TriangleAlert className="h-5 w-5 text-amber-500" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Too much to draw at once</h2>
          <p className="max-w-md text-xs text-muted-foreground">
            This view holds {filtered.nodes.length} entities, past the {MAX_GRAPH_NODES} the canvas
            can show legibly. Narrow it with the entity and relationship filters, or reduce the
            depth.
          </p>
        </Card>
      ) : filtered.nodes.length === 0 ? (
        <EmptyState
          icon={<Network className="h-4 w-4" />}
          title="Nothing matches these filters"
          description="This entity has no relationships of the selected types."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className={selectedNode || selectedEdge ? "lg:col-span-3" : "lg:col-span-4"}>
              <GraphCanvas
                ref={canvasRef}
                subgraph={filtered}
                colorKeys={colorKeys}
                selectedNodeId={selectedNode?.id ?? null}
                selectedEdgeId={selectedEdge?.id ?? null}
                highlightedIds={pathIds}
                layout={layout}
                onSelectNode={(node) => {
                  setSelectedNode(node);
                  if (node) setSelectedEdge(null);
                }}
                onSelectEdge={(edge) => {
                  setSelectedEdge(edge);
                  if (edge) setSelectedNode(null);
                }}
                onExpandNode={expandNode}
                className="h-[620px]"
              />
            </div>

            {(selectedNode || selectedEdge) && (
              <div className="h-[620px] lg:col-span-1">
                {selectedNode ? (
                  <NodeInspector
                    node={selectedNode}
                    onClose={() => setSelectedNode(null)}
                    onExpand={expandNode}
                  />
                ) : (
                  <EdgeInspector
                    edge={selectedEdge}
                    nodes={filtered.nodes}
                    onClose={() => setSelectedEdge(null)}
                  />
                )}
              </div>
            )}
          </div>

          <GraphLegend entityTypes={schema.data?.entityTypes ?? []} />

          <GraphListView
            subgraph={filtered}
            selectedNodeId={selectedNode?.id ?? null}
            onSelectNode={(node) => {
              setSelectedNode(node);
              setSelectedEdge(null);
              canvasRef.current?.focusNode(node.id);
            }}
            onSelectEdge={(edge) => {
              setSelectedEdge(edge);
              setSelectedNode(null);
            }}
            onExpandNode={expandNode}
          />
        </>
      )}
    </div>
  );
}

function SearchResults({
  isPending,
  items,
  onPick,
}: {
  isPending: boolean;
  items: { id: string; label: string; type: string; isSampleData: boolean }[];
  onPick: (id: string) => void;
}) {
  if (isPending) {
    return <Skeleton className="h-16 w-full rounded-md" />;
  }
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
        No entity matches that search.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2 rounded-md border border-border bg-card p-3">
      {items.slice(0, 12).map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onPick(item.id)}
            className="cursor-pointer rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <span className="flex items-center gap-1.5">
              <EntityBadge type={item.type} iconOnly size="sm" />
              {item.label}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
