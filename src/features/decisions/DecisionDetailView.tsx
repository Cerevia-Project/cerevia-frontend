"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, GitBranch, History, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { SourcePreview } from "@/components/evidence/SourcePreview";
import {
  useDecision,
  useDecisionRevisions,
  useDecisionTrace,
} from "@/features/decisions/api";
import { entityHref, graphHref } from "@/lib/entity-routes";
import { formatDate, humanize } from "@/lib/formatters";
import { errorMessage } from "@/api/errors";
import type { Citation, DecisionValidity, EntityRef } from "@/api/types";

const VALIDITY_COPY: Record<DecisionValidity, { label: string; styles: string; detail: string }> = {
  still_valid: {
    label: "Still valid",
    styles: "text-success border-success/30 bg-success/5",
    detail: "Nothing recorded since supersedes this decision.",
  },
  superseded: {
    label: "Superseded",
    styles: "text-amber-900 dark:text-amber-300 border-amber-500/40 bg-amber-500/10",
    detail: "A later decision replaces this one.",
  },
  unclear: {
    label: "Unclear",
    styles: "text-muted-foreground",
    detail: "The evidence does not establish whether this decision still holds.",
  },
};

export function DecisionDetailView({ decisionId }: { decisionId: string }) {
  const decision = useDecision(decisionId);
  const revisions = useDecisionRevisions(decisionId);
  const [traceOpen, setTraceOpen] = React.useState(false);
  const trace = useDecisionTrace(decisionId, traceOpen);
  const [previewCitation, setPreviewCitation] = React.useState<Citation | null>(null);

  return (
    <div className="max-w-5xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
        <Link href="/decisions">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Back to decisions
        </Link>
      </Button>

      <QueryBoundary
        query={decision}
        errorTitle="Could not load this decision"
        notFoundTitle="Decision not found"
      >
        {(detail) => (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    {detail.title}
                  </h1>
                  {detail.isSampleData && <SampleDataBadge />}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">
                    {humanize(detail.status)}
                  </Badge>
                  <span className="font-mono">{formatDate(detail.date)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setTraceOpen((open) => !open)}
                >
                  <GitBranch className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {traceOpen ? "Hide trace" : "Trace evidence"}
                </Button>
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                  <Link href={graphHref({ entity: detail.id })}>
                    <Network className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Open in the graph
                  </Link>
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <Card>
                  <CardHeader className="border-b border-border p-4">
                    <CardTitle className="text-sm font-semibold">Rationale</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {detail.rationale}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b border-border p-4">
                    <CardTitle className="text-sm font-semibold">Alternatives considered</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {detail.alternatives.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No alternatives are recorded for this decision.
                      </p>
                    ) : (
                      <ul className="list-disc space-y-1 pl-4 text-xs text-foreground">
                        {detail.alternatives.map((alternative, index) => (
                          <li key={index}>{alternative}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b border-border p-4">
                    <CardTitle className="text-sm font-semibold">Supporting evidence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-4">
                    {detail.citations.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No source passage is attached to this decision.
                      </p>
                    ) : (
                      detail.citations.map((citation, index) => (
                        <button
                          key={citation.id}
                          type="button"
                          onClick={() => setPreviewCitation(citation)}
                          className="w-full cursor-pointer rounded-md border border-border bg-muted/30 p-2.5 text-left transition-colors hover:border-primary/40"
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-medium text-foreground">
                              {citation.documentTitle}
                            </span>
                            <CitationChip citation={citation} index={index + 1} size="sm" />
                          </span>
                          <span className="mt-1 block line-clamp-2 text-[11px] text-muted-foreground">
                            {citation.passage}
                          </span>
                        </button>
                      ))
                    )}
                  </CardContent>
                </Card>

                {traceOpen && (
                  <Card>
                    <CardHeader className="border-b border-border p-4">
                      <CardTitle className="text-sm font-semibold">Evidence trail</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4">
                      {trace.isPending ? (
                        <Skeleton className="h-24 w-full rounded-md" />
                      ) : trace.isError ? (
                        <p className="text-xs text-muted-foreground">{errorMessage(trace.error)}</p>
                      ) : trace.data ? (
                        <>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${VALIDITY_COPY[trace.data.validity].styles}`}
                          >
                            {VALIDITY_COPY[trace.data.validity].label}
                          </Badge>
                          <p className="text-[11px] text-muted-foreground">
                            {VALIDITY_COPY[trace.data.validity].detail}
                          </p>

                          {trace.data.paths.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              No relationship path is recorded for this decision.
                            </p>
                          ) : (
                            <ol className="space-y-1.5">
                              {trace.data.paths.map((path) => (
                                <li
                                  key={path.id}
                                  className="rounded-md border border-border/60 bg-muted/40 p-2 text-[11px] text-foreground"
                                >
                                  {path.description}
                                </li>
                              ))}
                            </ol>
                          )}

                          {trace.data.citations.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {trace.data.citations.map((citation, index) => (
                                <CitationChip
                                  key={citation.id}
                                  citation={citation}
                                  index={index + 1}
                                  onOpenPreview={setPreviewCitation}
                                  size="sm"
                                />
                              ))}
                            </div>
                          )}
                        </>
                      ) : null}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="border-b border-border p-4">
                    <CardTitle className="text-sm font-semibold">Accountability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 text-xs">
                    {/* An unrecorded owner or approver is itself a finding,
                        so it is stated rather than left blank. */}
                    <PersonField label="Owner" person={detail.owner} />
                    <PersonField label="Approver" person={detail.approver} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b border-border p-4">
                    <CardTitle className="text-sm font-semibold">Affected entities</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    {detail.affectedEntities.length === 0 ? (
                      <p className="px-1 py-2 text-xs text-muted-foreground">
                        Nothing is recorded as affected by this decision.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {detail.affectedEntities.map((entity) => (
                          <Link key={entity.id} href={entityHref(entity.type, entity.id)}>
                            <EntityBadge
                              type={entity.type}
                              label={entity.label}
                              size="sm"
                              clickable
                            />
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center gap-2 border-b border-border p-4">
                    <History className="h-4 w-4 text-primary" aria-hidden="true" />
                    <CardTitle className="text-sm font-semibold">Revisions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    {revisions.isPending ? (
                      <Skeleton className="h-12 w-full rounded-md" />
                    ) : revisions.data && revisions.data.items.length > 0 ? (
                      <ol className="space-y-2 border-l border-border pl-3">
                        {revisions.data.items.map((revision) => (
                          <li key={revision.id} className="relative">
                            <span
                              className="absolute -left-[17px] top-1.5 h-1.5 w-1.5 rounded-full bg-primary"
                              aria-hidden="true"
                            />
                            <Link
                              href={entityHref(revision.type, revision.id)}
                              className="text-xs text-foreground hover:text-primary"
                            >
                              {revision.label}
                            </Link>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <EmptyState
                        className="min-h-0 border-0 bg-transparent p-2"
                        title="No revisions"
                        description="This decision has not been revised or superseded."
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </QueryBoundary>

      <SourcePreview
        citation={previewCitation}
        open={Boolean(previewCitation)}
        onOpenChange={(open) => !open && setPreviewCitation(null)}
      />
    </div>
  );
}

function PersonField({ label, person }: { label: string; person?: EntityRef | null }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      {person ? (
        <Link href={entityHref(person.type, person.id)}>
          <EntityBadge type={person.type} label={person.label} size="sm" clickable />
        </Link>
      ) : (
        <p className="text-muted-foreground">Not recorded</p>
      )}
    </div>
  );
}
