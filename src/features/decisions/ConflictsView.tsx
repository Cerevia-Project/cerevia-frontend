"use client";

import * as React from "react";
import { ShieldQuestion } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, QueryBoundary } from "@/components/feedback";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { useConflicts, useReviewConflict } from "@/features/conflicts/api";
import { usePermission } from "@/providers/session-provider";
import { formatDate, humanize } from "@/lib/formatters";
import type { Conflict } from "@/api/types";

/**
 * Conflicting records, side by side.
 *
 * Neither side is styled as the winner: the API does not rank them, and the
 * UI will not invent an order. Reviewer controls appear only with permission.
 */
export function ConflictsView() {
  const query = useConflicts();

  return (
    <QueryBoundary
      query={query}
      errorTitle="Could not load conflicts"
      isEmpty={(page) => page.items.length === 0}
      empty={
        <EmptyState
          icon={<ShieldQuestion className="h-4 w-4" />}
          title="No conflicts detected"
          description="Nothing in the knowledge base is currently flagged as contradictory."
        />
      }
    >
      {(page) => (
        <div className="space-y-4">
          {page.items.map((conflict) => (
            <ConflictCard key={conflict.id} conflict={conflict} />
          ))}
        </div>
      )}
    </QueryBoundary>
  );
}

const STATUS_STYLES: Record<string, string> = {
  open: "text-amber-900 dark:text-amber-300 border-amber-500/40 bg-amber-500/10",
  needs_review: "text-primary border-primary/30 bg-primary/5",
  resolved: "text-success border-success/30 bg-success/5",
};

function ConflictCard({ conflict }: { conflict: Conflict }) {
  const canResolve = usePermission("conflicts:resolve");
  const review = useReviewConflict(conflict.id);
  const [note, setNote] = React.useState(conflict.note ?? "");

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b border-border p-4">
        <div className="space-y-1.5">
          <CardTitle className="text-sm font-semibold">{conflict.relationship}</CardTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {humanize(conflict.kind)}
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[conflict.status] ?? ""}`}>
              {humanize(conflict.status)}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {conflict.entities.map((entity) => (
            <EntityBadge key={entity.id} type={entity.type} label={entity.label} size="sm" />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {conflict.sides.map((side, index) => (
            <div key={side.citation.id} className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Record {index + 1}
                </span>
                <CitationChip citation={side.citation} index={index + 1} size="sm" />
              </div>
              <blockquote className="border-l-2 border-border pl-2 text-[11px] leading-relaxed text-foreground">
                {side.citation.passage}
              </blockquote>
              <dl className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="font-mono text-foreground">{formatDate(side.date)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Approval</dt>
                  <dd className="text-foreground">{humanize(side.approvalStatus)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Authority</dt>
                  <dd className="text-foreground">{side.authority}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {conflict.note && (
          <p className="rounded-md border border-border bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
            Reviewer note: {conflict.note}
          </p>
        )}

        {canResolve && (
          <div className="space-y-2 border-t border-border pt-3">
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a reviewer note (optional)…"
              rows={2}
              className="resize-none text-xs"
              aria-label="Reviewer note"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={review.isPending || conflict.status === "needs_review"}
                onClick={() =>
                  review.mutate(
                    { status: "needs_review", note: note.trim() || undefined },
                    { onSuccess: () => toast.success("Marked as needing review.") },
                  )
                }
              >
                Mark as needing review
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={review.isPending || conflict.status === "resolved"}
                onClick={() =>
                  review.mutate(
                    { status: "resolved", note: note.trim() || undefined },
                    { onSuccess: () => toast.success("Conflict marked as resolved.") },
                  )
                }
              >
                Mark as resolved
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
