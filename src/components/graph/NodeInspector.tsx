"use client";

import * as React from "react";
import { GraphNode, GraphEdge } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import {
  X,
  ExternalLink,
  GitCommit,
  Network,
  Share2,
  Calendar,
} from "lucide-react";

export interface NodeInspectorProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
  onNavigateToNode?: (nodeId: string) => void;
  className?: string;
}

export function NodeInspector({
  node,
  edges,
  allNodes,
  onClose,
  onNavigateToNode,
  className,
}: NodeInspectorProps) {
  if (!node) return null;

  // Find connected edges and neighbors
  const connectedEdges = edges.filter(
    (e) => e.source === node.id || e.target === node.id
  );

  const nodeMap = new Map<string, GraphNode>();
  allNodes.forEach((n) => nodeMap.set(n.id, n));

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Inspector Header */}
      <div className="flex items-center justify-between border-b border-border p-3.5 bg-secondary/30">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-secondary border border-border">
            <Network className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
              Node Inspector
            </h4>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Inspector Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Node Summary Card */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-mono uppercase bg-secondary text-muted-foreground border border-border mb-1">
                {node.type}
              </span>
              <h3 className="text-sm font-semibold text-foreground leading-snug">
                {node.label}
              </h3>
            </div>
            {node.evidenceState && (
              <EvidenceBadge state={node.evidenceState} size="sm" />
            )}
          </div>
          {node.description && (
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {node.description}
            </p>
          )}
        </div>

        {/* Node Metadata Table */}
        {node.metadata && Object.keys(node.metadata).length > 0 && (
          <div className="space-y-1.5">
            <h5 className="text-[11px] font-medium text-foreground uppercase tracking-wider font-mono">
              Attributes
            </h5>
            <div className="rounded border border-border divide-y divide-border bg-background/50">
              {Object.entries(node.metadata).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between px-2.5 py-1.5 text-[11px]">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="font-mono text-foreground">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connected Neighbors List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-[11px] font-medium text-foreground uppercase tracking-wider font-mono">
              Connected Relations ({connectedEdges.length})
            </h5>
          </div>

          {connectedEdges.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">No linked relations</p>
          ) : (
            <div className="space-y-1.5">
              {connectedEdges.map((edge) => {
                const isSource = edge.source === node.id;
                const otherNodeId = isSource ? edge.target : edge.source;
                const otherNode = nodeMap.get(otherNodeId);
                if (!otherNode) return null;

                return (
                  <button
                    key={edge.id}
                    onClick={() => onNavigateToNode?.(otherNode.id)}
                    className="w-full text-left flex items-center justify-between p-2 rounded border border-border bg-card hover:bg-secondary/60 transition-colors group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <GitCommit className="h-3 w-3 text-muted-foreground shrink-0" />
                      <div className="truncate">
                        <p className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {otherNode.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {isSource ? `→ ${edge.label}` : `← ${edge.label}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                      {otherNode.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Inspector Footer Actions */}
      <div className="border-t border-border p-3 flex items-center justify-between gap-2 bg-secondary/10">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs flex-1 gap-1.5"
          onClick={() => {
            const url = `/${node.type === "document" ? "sources" : `${node.type}s`}/${node.id}`;
            window.location.href = url;
          }}
        >
          <ExternalLink className="h-3 w-3" />
          Open Detail
        </Button>
      </div>
    </div>
  );
}
