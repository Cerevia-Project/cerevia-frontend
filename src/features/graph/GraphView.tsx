"use client";

import * as React from "react";
import { GraphCanvas, GraphControls, NodeInspector } from "@/components/graph";
import { MOCK_GRAPH_DATA } from "@/mocks/graph";
import { GraphNode, EntityType } from "@/types";
import { Badge } from "@/components/ui/badge";

export function GraphView() {
  const [zoom, setZoom] = React.useState(1);
  const [filterType, setFilterType] = React.useState<EntityType | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedNode, setSelectedNode] = React.useState<GraphNode | null>(
    MOCK_GRAPH_DATA.nodes[0]
  );

  const filteredGraphData = React.useMemo(() => {
    let nodes = MOCK_GRAPH_DATA.nodes;
    if (filterType !== "all") {
      nodes = nodes.filter((n) => n.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nodes = nodes.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q)
      );
    }
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = MOCK_GRAPH_DATA.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );
    return { nodes, edges };
  }, [filterType, searchQuery]);

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Knowledge Graph Explorer
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              FalkorDB Graph Engine
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive enterprise graph visualization mapping relationships between people, teams, projects, decisions, and documents.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <GraphControls
        zoom={zoom}
        onZoomChange={setZoom}
        onResetZoom={() => setZoom(1)}
        filterType={filterType}
        onFilterChange={setFilterType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        nodeCount={filteredGraphData.nodes.length}
        edgeCount={filteredGraphData.edges.length}
      />

      {/* Canvas & Node Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Graph Canvas */}
        <div className={selectedNode ? "lg:col-span-3" : "lg:col-span-4"}>
          <GraphCanvas
            data={filteredGraphData}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={setSelectedNode}
            zoom={zoom}
            filterType={filterType}
            className="h-[620px]"
          />
        </div>

        {/* Node Inspector Sidebar */}
        {selectedNode && (
          <div className="lg:col-span-1 h-[620px]">
            <NodeInspector
              node={selectedNode}
              edges={MOCK_GRAPH_DATA.edges}
              allNodes={MOCK_GRAPH_DATA.nodes}
              onClose={() => setSelectedNode(null)}
              onNavigateToNode={(nodeId) => {
                const found = MOCK_GRAPH_DATA.nodes.find((n) => n.id === nodeId);
                if (found) setSelectedNode(found);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
