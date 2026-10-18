"use client";

import * as React from "react";
import { CircleHelp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InsufficientEvidenceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** What the system does know, taken from the answer's claims. */
  known?: string[];
  /** What it could not establish. */
  missing?: string[];
  /** Follow-ups offered by the API; clicking one asks it. */
  nextSteps?: string[];
  onNextStep?: (step: string) => void;
}

/**
 * Shown when the API reports `insufficient_evidence`. Saying what is missing
 * is the answer; nothing here invents a conclusion to fill the gap.
 */
export function InsufficientEvidence({
  known = [],
  missing = [],
  nextSteps = [],
  onNextStep,
  className,
  ...props
}: InsufficientEvidenceProps) {
  return (
    <div
      className={cn("rounded-md border border-border bg-muted/30 p-4 space-y-3", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <CircleHelp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">Not enough evidence to answer</h3>
      </div>

      {known.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            What is established
          </h4>
          <ul className="list-disc space-y-0.5 pl-4 text-xs text-foreground">
            {known.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {missing.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            What is missing
          </h4>
          <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
            {missing.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {nextSteps.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Lightbulb className="h-3 w-3" aria-hidden="true" /> Suggested next steps
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {nextSteps.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => onNextStep?.(step)}
                disabled={!onNextStep}
                className={cn(
                  "rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground",
                  onNextStep && "cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent",
                )}
              >
                {step}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
