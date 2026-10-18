"use client";

import * as React from "react";
import { Network } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Citation, Claim, GraphPath } from "@/api/types";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CitationChip } from "@/components/evidence/CitationChip";

export interface EvidencePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  claim: Claim;
  /** The answer's full citation list; the claim references it by id. */
  citations: Citation[];
  paths?: GraphPath[];
  onOpenPreview?: (citation: Citation) => void;
  onOpenPath?: (path: GraphPath) => void;
}

const BORDER_ACCENT: Record<string, string> = {
  confirmed: "border-l-emerald-500",
  inferred: "border-l-blue-500",
  hypothesis: "border-l-purple-500 border-l-2",
  conflicting: "border-l-amber-500",
  missing: "border-l-slate-400",
};

/**
 * One claim with the evidence behind it. Nothing here is composed client-side:
 * the text, the kind and the citations all come from the API.
 */
export function EvidencePanel({
  claim,
  citations,
  paths = [],
  onOpenPreview,
  onOpenPath,
  className,
  ...props
}: EvidencePanelProps) {
  // Tolerant reader: a claim missing its id lists renders without evidence
  // rather than taking the whole conversation down with it.
  const claimCitations = (claim.citationIds ?? [])
    .map((id) => citations.find((citation) => citation.id === id))
    .filter((citation): citation is Citation => Boolean(citation));

  const claimPaths = (claim.pathIds ?? [])
    .map((id) => paths.find((path) => path.id === id))
    .filter((path): path is GraphPath => Boolean(path));

  // Citation markers stay consistent with the answer body's numbering.
  const markerOf = (citation: Citation) =>
    citations.findIndex((entry) => entry.id === citation.id) + 1;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-l-4 bg-card text-card-foreground shadow-xs",
        BORDER_ACCENT[claim.kind] ?? "border-l-primary",
        className,
      )}
      {...props}
    >
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <EvidenceBadge kind={claim.kind} size="sm" />
          <span className="font-mono text-[10px] text-muted-foreground">{claim.id}</span>
        </div>

        <p className="text-sm font-medium leading-snug text-foreground">{claim.text}</p>

        {claimCitations.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sources ({claimCitations.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {claimCitations.map((citation) => (
                <CitationChip
                  key={citation.id}
                  citation={citation}
                  index={markerOf(citation)}
                  onOpenPreview={onOpenPreview}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}

        {claimPaths.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Reasoning trail
            </span>
            {claimPaths.map((path) => (
              <button
                key={path.id}
                type="button"
                onClick={() => onOpenPath?.(path)}
                disabled={!onOpenPath}
                className={cn(
                  "flex w-full items-start gap-1.5 rounded-md border border-border/60 bg-muted/40 p-2.5 text-left text-[11px] text-foreground",
                  onOpenPath && "cursor-pointer transition-colors hover:border-primary/40",
                )}
              >
                <Network className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span className="leading-relaxed">{path.description}</span>
              </button>
            ))}
          </div>
        )}

        {claimCitations.length === 0 && claim.kind !== "missing" && (
          <p className="text-[11px] italic text-muted-foreground">
            No source passage was attached to this statement.
          </p>
        )}
      </div>
    </div>
  );
}
