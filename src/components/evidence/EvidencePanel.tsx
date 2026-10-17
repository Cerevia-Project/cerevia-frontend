"use client";

import * as React from "react";
import {
  Network,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EvidenceClaim } from "@/types";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CitationChip } from "@/components/evidence/CitationChip";

export interface EvidencePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  claim: EvidenceClaim;
  collapsible?: boolean;
}

export function EvidencePanel({
  claim,
  collapsible = false,
  className,
  ...props
}: EvidencePanelProps) {
  const [expanded, setExpanded] = React.useState(true);

  const borderAccents = {
    confirmed: "border-l-emerald-500",
    inferred: "border-l-blue-500",
    hypothesis: "border-l-purple-500 border-l-2",
    conflicting: "border-l-amber-500",
    missing: "border-l-slate-400",
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden transition-all border-l-4",
        borderAccents[claim.state] || "border-l-primary",
        className
      )}
      {...props}
    >
      {/* Panel Header */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <EvidenceBadge state={claim.state} size="default" />
            <span className="font-mono text-xs text-muted-foreground">
              {claim.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              {claim.confidenceScore}% Confidence
            </span>
            {collapsible && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer px-1 py-0.5"
              >
                {expanded ? "Collapse" : "Expand"}
              </button>
            )}
          </div>
        </div>

        {/* Claim Statement */}
        <h4 className="text-sm font-semibold text-foreground leading-snug">
          {claim.claim}
        </h4>

        {/* Rationale */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {claim.rationale}
        </p>

        {expanded && (
          <div className="space-y-4 pt-2">
            {/* Citations List */}
            {claim.citations && claim.citations.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Supporting Sources ({claim.citations.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {claim.citations.map((citation) => (
                    <CitationChip key={citation.id} citation={citation} />
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Graph Multi-Hop Relational Path */}
            {claim.graphPath && claim.graphPath.length > 0 && (
              <div className="p-2.5 rounded-md bg-muted/40 border border-border/60 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5 font-medium text-[11px]">
                  <Network className="h-3.5 w-3.5 text-primary" />
                  <span>FalkorDB Knowledge Graph Trace</span>
                </div>
                <div className="flex items-center flex-wrap gap-1 font-mono text-[11px] text-foreground">
                  {claim.graphPath.map((node, index) => {
                    const isRelation = index % 2 === 1;
                    return (
                      <React.Fragment key={index}>
                        {isRelation ? (
                          <span className="text-primary text-[10px] px-1 bg-primary/10 rounded">
                            -{node}&gt;
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                            {node}
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Counter Evidence or Conflict Alert */}
            {claim.counterEvidence && (
              <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">Divergence Detected</span>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {claim.counterEvidence}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
