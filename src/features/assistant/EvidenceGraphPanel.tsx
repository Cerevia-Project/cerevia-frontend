"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { AccessLimitedNotice } from "@/components/feedback/AccessLimitedNotice";
import { graphHref } from "@/lib/entity-routes";
import type { Citation, Claim, Conflict, EntityRef, GraphPath, Subgraph } from "@/api/types";

export interface EvidenceGraphPanelProps {
  claims: Claim[];
  citations: Citation[];
  paths: GraphPath[];
  conflicts: Conflict[];
  relatedEntities: EntityRef[];
  subgraph?: Subgraph;
  accessLimited?: boolean;
  messageId?: string | null;
  onOpenCitation?: (citation: Citation) => void;
}

export function EvidenceGraphPanel({
  claims,
  citations,
  paths,
  conflicts,
  relatedEntities,
  subgraph,
  accessLimited,
  messageId,
  onOpenCitation,
}: EvidenceGraphPanelProps) {
  const traceSubgraph = React.useMemo<Subgraph | null>(() => {
    if (!subgraph) return null;
    if (paths.length === 0) return subgraph;

    const nodeIds = new Set(paths.flatMap((path) => path.nodeIds ?? []));
    const edgeIds = new Set(paths.flatMap((path) => path.edgeIds ?? []));
    return {
      nodes: subgraph.nodes.filter((node) => nodeIds.has(node.id)),
      edges: subgraph.edges.filter((edge) => edgeIds.has(edge.id)),
      truncated: subgraph.truncated,
    };
  }, [subgraph, paths]);

  const pathParam = paths.flatMap((path) => [...path.nodeIds, ...path.edgeIds]).join(",");

  return (
    <aside
      aria-label="Evidence and reasoning"
      className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card"
    >
      <Tabs defaultValue="evidence" className="flex h-full flex-col">
        <div className="border-b border-border p-2">
          <TabsList className="w-full">
            <TabsTrigger value="evidence" className="flex-1">
              Evidence
            </TabsTrigger>
            <TabsTrigger value="trace" className="flex-1">
              Trace
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="evidence" className="flex-1 space-y-3 overflow-y-auto p-3">
          {accessLimited && <AccessLimitedNotice />}

          {claims.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              Claims and citations appear here as the answer is written.
            </p>
          ) : (
            claims.map((claim) => (
              <EvidencePanel
                key={claim.id}
                claim={claim}
                citations={citations}
                paths={paths}
                onOpenPreview={onOpenCitation}
              />
            ))
          )}

          {conflicts.length > 0 && (
            <section className="space-y-1.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Conflicting records
              </h3>
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-900 dark:text-amber-200"
                >
                  <p className="font-medium">{conflict.relationship}</p>
                  <p className="mt-0.5 opacity-90">
                    {conflict.sides.length} sources disagree. Neither is shown as correct here.
                  </p>
                </div>
              ))}
            </section>
          )}

          {relatedEntities.length > 0 && (
            <section className="space-y-1.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Related entities
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {relatedEntities.map((entity) => (
                  <Link key={entity.id} href={graphHref({ entity: entity.id })}>
                    <EntityBadge type={entity.type} label={entity.label} size="sm" clickable />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </TabsContent>

        <TabsContent value="trace" className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
          {paths.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              This answer did not trace a relationship path.
            </p>
          ) : (
            <>
              <ol className="space-y-1.5">
                {paths.map((path) => (
                  <li
                    key={path.id}
                    className="flex items-start gap-1.5 rounded-md border border-border/60 bg-muted/40 p-2 text-[11px] text-foreground"
                  >
                    <Network className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                    {path.description}
                  </li>
                ))}
              </ol>

              {traceSubgraph && traceSubgraph.nodes.length > 0 && (
                <GraphCanvas subgraph={traceSubgraph} layout="hierarchical" className="h-56" />
              )}

              <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                <Link
                  href={graphHref({
                    entity: paths[0]?.nodeIds[0],
                    path: pathParam,
                    fromMessage: messageId ?? undefined,
                  })}
                >
                  Open in the graph explorer
                  <ExternalLink className="ml-1.5 h-3 w-3" aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
}
