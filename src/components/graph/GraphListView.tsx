"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { SampleDataBadge } from "@/components/feedback/SampleDataBadge";
import { formatPercent, humanize } from "@/lib/formatters";
import type { GraphEdge, GraphNode, Subgraph } from "@/api/types";

export interface GraphListViewProps {
  subgraph: Subgraph;
  selectedNodeId?: string | null;
  onSelectNode: (node: GraphNode) => void;
  onSelectEdge: (edge: GraphEdge) => void;
  onExpandNode?: (node: GraphNode) => void;
}

/**
 * The accessible equivalent of the canvas.
 *
 * A canvas graph cannot be read by a screen reader or driven from the
 * keyboard, so everything it shows is also a table here: rows are focusable,
 * Enter selects and `e` expands.
 */
export function GraphListView({
  subgraph,
  selectedNodeId,
  onSelectNode,
  onSelectEdge,
  onExpandNode,
}: GraphListViewProps) {
  const labelOf = React.useCallback(
    (id: string) => subgraph.nodes.find((node) => node.id === id)?.label ?? id,
    [subgraph.nodes],
  );

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="border-b border-border p-3">
        <h2 className="text-xs font-semibold text-foreground">Visible graph, as a list</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {subgraph.nodes.length} entities and {subgraph.edges.length} relationships are currently
          shown{subgraph.truncated ? ", and the result was truncated" : ""}.
        </p>
      </div>

      <Tabs defaultValue="nodes">
        <div className="px-3 pt-3">
          <TabsList>
            <TabsTrigger value="nodes">Entities</TabsTrigger>
            <TabsTrigger value="edges">Relationships</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="nodes" className="mt-2 max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] hover:bg-transparent">
                <TableHead>Entity</TableHead>
                <TableHead className="w-[130px]">Type</TableHead>
                <TableHead className="w-[110px] text-right">Hidden links</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {subgraph.nodes.map((node) => (
                <TableRow
                  key={node.id}
                  tabIndex={0}
                  role="button"
                  aria-pressed={node.id === selectedNodeId}
                  onClick={() => onSelectNode(node)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectNode(node);
                    } else if (event.key.toLowerCase() === "e" && onExpandNode) {
                      event.preventDefault();
                      onExpandNode(node);
                    }
                  }}
                  className={`cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    node.id === selectedNodeId ? "bg-secondary/70" : ""
                  }`}
                >
                  <TableCell className="font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      {node.label}
                      {node.isSampleData && <SampleDataBadge />}
                    </span>
                  </TableCell>
                  <TableCell>
                    <EntityBadge type={node.type} size="sm" />
                  </TableCell>
                  <TableCell className="text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                    {node.hiddenNeighborCount ? `${node.hiddenNeighborCount} more` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="edges" className="mt-2 max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] hover:bg-transparent">
                <TableHead>Relationship</TableHead>
                <TableHead className="w-[110px]">State</TableHead>
                <TableHead className="w-[100px] text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {subgraph.edges.map((edge) => (
                <TableRow
                  key={edge.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => onSelectEdge(edge)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectEdge(edge);
                    }
                  }}
                  className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <TableCell className="text-foreground">
                    {labelOf(edge.from)}{" "}
                    <span className="font-mono text-[10px] text-primary">
                      -{humanize(edge.type).toLowerCase()}→
                    </span>{" "}
                    {labelOf(edge.to)}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {edge.current ? "Current" : "Historical"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[11px] tabular-nums">
                    {formatPercent(edge.confidence)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
