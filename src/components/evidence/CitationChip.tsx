"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Citation } from "@/api/types";
import { SourcePreview } from "@/components/evidence/SourcePreview";
import { humanize, truncate, formatVersion } from "@/lib/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface CitationChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  citation: Citation;
  index: number;
  onOpenPreview?: (citation: Citation) => void;
  size?: "sm" | "default";
}

export function CitationChip({
  citation,
  index,
  onOpenPreview,
  size = "default",
  className,
  ...props
}: CitationChipProps) {
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const location = [
    citation.section ? `Section ${citation.section}` : null,
    citation.page !== null && citation.page !== undefined ? `Page ${citation.page}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <TooltipProvider delayDuration={250}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => (onOpenPreview ? onOpenPreview(citation) : setPreviewOpen(true))}
              className={cn(
                "inline-flex cursor-pointer select-none items-center gap-1 rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
                size === "sm" && "px-1.5 text-[10px]",
                className,
              )}
              aria-label={`Citation ${index}: ${citation.documentTitle}`}
              {...props}
            >
              <FileText className="h-3 w-3 shrink-0 text-primary/70" aria-hidden="true" />
              <span>[{index}]</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs space-y-1 p-2 text-xs">
            <p className="font-semibold text-foreground">{citation.documentTitle}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {formatVersion(citation.documentVersion)}
              {location ? ` · ${location}` : ""} · {humanize(citation.sourceStatus)}
            </p>
            <p className="line-clamp-3 text-[11px] text-muted-foreground">
              {truncate(citation.passage, 180)}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {!onOpenPreview && (
        <SourcePreview citation={citation} open={previewOpen} onOpenChange={setPreviewOpen} />
      )}
    </>
  );
}
