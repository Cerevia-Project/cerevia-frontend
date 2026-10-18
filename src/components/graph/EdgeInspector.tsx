"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProvenanceList } from "@/components/graph/ProvenanceList";
import { useEdge } from "@/features/graph/api";
import { errorMessage } from "@/api/errors";
import { formatDate, formatPercent, humanize } from "@/lib/formatters";
import type { GraphEdge, GraphNode } from "@/api/types";

export interface EdgeInspectorProps {
  edge: GraphEdge | null;
  /** Nodes currently on the canvas, used to name the endpoints. */
  nodes: GraphNode[];
  onClose: () => void;
  className?: string;
}

/** A relationship and the passages that justify it. */
export function EdgeInspector({ edge, nodes, onClose, className }: EdgeInspectorProps) {
  const detail = useEdge(edge?.id ?? null);

  if (!edge) return null;

  const full = detail.data ?? edge;
  const labelOf = (id: string) => nodes.find((node) => node.id === id)?.label ?? id;

  return (
    <aside
      aria-label={`Relationship ${edge.type}`}
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-2 border-b border-border p-3">
        <div className="min-w-0 space-y-1.5">
          <Badge variant="outline" className="font-mono text-[10px]">
            {humanize(edge.type)}
          </Badge>
          <p className="text-xs leading-relaxed text-foreground">
            <span className="font-medium">{labelOf(edge.from)}</span>
            <span className="text-muted-foreground"> → </span>
            <span className="font-medium">{labelOf(edge.to)}</span>
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close the inspector">
          <X className="h-3.5 w-3.5" />
        </Button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <dl className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <dt className="text-muted-foreground">Confidence</dt>
            <dd className="font-mono tabular-nums text-foreground">
              {formatPercent(full.confidence)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">State</dt>
            <dd className="text-foreground">{full.current ? "Current" : "Historical"}</dd>
          </div>
          {full.validFrom && (
            <div>
              <dt className="text-muted-foreground">Valid from</dt>
              <dd className="font-mono text-foreground">{formatDate(full.validFrom)}</dd>
            </div>
          )}
          {full.validTo && (
            <div>
              <dt className="text-muted-foreground">Valid to</dt>
              <dd className="font-mono text-foreground">{formatDate(full.validTo)}</dd>
            </div>
          )}
        </dl>

        <section className="space-y-1.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Provenance
          </h3>
          {detail.isPending ? (
            <Skeleton className="h-16 w-full rounded-md" />
          ) : detail.isError ? (
            <p className="text-[11px] text-muted-foreground">{errorMessage(detail.error)}</p>
          ) : (
            <ProvenanceList provenance={full.provenance ?? []} />
          )}
        </section>
      </div>
    </aside>
  );
}
