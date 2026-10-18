"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Network, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityBadge, entityTypeConfig } from "@/components/entities/EntityBadge";
import { SampleDataBadge } from "@/components/feedback/SampleDataBadge";
import { ProvenanceList } from "@/components/graph/ProvenanceList";
import { useEntity } from "@/features/graph/api";
import { entityHref } from "@/lib/entity-routes";
import { errorMessage } from "@/api/errors";
import type { GraphNode } from "@/api/types";

export interface NodeInspectorProps {
  node: GraphNode | null;
  onClose: () => void;
  onExpand?: (node: GraphNode) => void;
  className?: string;
}

/**
 * Properties and provenance for the selected entity.
 *
 * The summary comes from the subgraph already on screen; the full record and
 * its provenance are fetched from `GET /graph/entities/{id}`.
 */
export function NodeInspector({ node, onClose, onExpand, className }: NodeInspectorProps) {
  const detail = useEntity(node?.id ?? null);

  if (!node) return null;

  const config = entityTypeConfig(node.type);
  const properties = Object.entries(detail.data?.properties ?? node.properties ?? {});

  return (
    <aside
      aria-label={`Details for ${node.label}`}
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-2 border-b border-border p-3">
        <div className="min-w-0 space-y-1.5">
          <EntityBadge type={node.type} size="sm" />
          <h2 className="truncate text-sm font-semibold text-foreground" title={node.label}>
            {node.label}
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">{node.id}</span>
            {node.isSampleData && <SampleDataBadge />}
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close the inspector">
          <X className="h-3.5 w-3.5" />
        </Button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {typeof node.hiddenNeighborCount === "number" && node.hiddenNeighborCount > 0 && (
          <p className="rounded-md border border-border bg-muted/40 p-2 text-[11px] text-muted-foreground">
            {node.hiddenNeighborCount} more connected{" "}
            {node.hiddenNeighborCount === 1 ? "entity is" : "entities are"} hidden. Expand to load
            them.
          </p>
        )}

        <section className="space-y-1.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Properties
          </h3>
          {detail.isPending ? (
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ) : properties.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              This entity has no properties beyond its label.
            </p>
          ) : (
            <dl className="space-y-1.5">
              {properties.map(([key, value]) => (
                <div key={key} className="grid grid-cols-[minmax(0,90px)_1fr] gap-2 text-[11px]">
                  <dt className="truncate text-muted-foreground">{key}</dt>
                  <dd className="break-words text-foreground">{formatValue(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section className="space-y-1.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Provenance
          </h3>
          {detail.isPending ? (
            <Skeleton className="h-16 w-full rounded-md" />
          ) : detail.isError ? (
            <p className="text-[11px] text-muted-foreground">{errorMessage(detail.error)}</p>
          ) : (
            <ProvenanceList provenance={detail.data?.provenance ?? []} />
          )}
        </section>
      </div>

      <footer className="flex items-center gap-2 border-t border-border p-3">
        {onExpand && (
          <Button variant="outline" size="sm" className="h-7 flex-1 text-xs" onClick={() => onExpand(node)}>
            <Network className="mr-1.5 h-3 w-3" aria-hidden="true" />
            Expand
          </Button>
        )}
        <Button asChild variant="ghost" size="sm" className="h-7 flex-1 text-xs">
          <Link href={entityHref(node.type, node.id)}>
            Open {config.label.toLowerCase()}
            <ExternalLink className="ml-1.5 h-3 w-3" aria-hidden="true" />
          </Link>
        </Button>
      </footer>
    </aside>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}
