"use client";

import * as React from "react";
import { FileText, ExternalLink, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Citation, SourceDocument } from "@/types";
import { SourcePreview } from "@/components/evidence/SourcePreview";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface CitationChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  citation: Citation;
  previewSource?: SourceDocument;
  onOpenPreview?: (citation: Citation) => void;
  size?: "sm" | "default";
}

export function CitationChip({
  citation,
  previewSource,
  onOpenPreview,
  size = "default",
  className,
  ...props
}: CitationChipProps) {
  const [internalPreviewOpen, setInternalPreviewOpen] = React.useState(false);

  const fallbackSource: SourceDocument = previewSource || {
    id: citation.code,
    title: citation.documentTitle || "Referenced Knowledge Source",
    type: citation.sourceType || "confluence",
    author: "Architecture Review Board",
    authorRole: "Technical Leadership",
    lastUpdated: "3 days ago",
    reliabilityScore: 95,
    section: "Section 3.1: Core Specifications",
    snippet: citation.snippet || "Organizational decision record validating this claim in the system.",
    highlightedText: citation.snippet || citation.label,
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onOpenPreview) {
      onOpenPreview(citation);
    } else {
      setInternalPreviewOpen(true);
    }
    props.onClick?.(e);
  };

  return (
    <>
      <TooltipProvider delayDuration={250}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleClick}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-accent hover:text-accent-foreground cursor-pointer select-none active:scale-[0.98]",
                size === "sm" && "text-[10px] px-1.5 py-0.2",
                className
              )}
              aria-label={`Citation ${citation.code}: ${citation.documentTitle}`}
              {...props}
            >
              <FileText className="h-3 w-3 shrink-0 text-primary/70" />
              <span>[{citation.code}]</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs space-y-1 p-2">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <Bookmark className="h-3 w-3 text-primary" />
              {citation.documentTitle}
            </p>
            {citation.label && (
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                &ldquo;{citation.label}&rdquo;
              </p>
            )}
            <p className="text-[10px] text-primary/80 pt-1 flex items-center gap-1 font-mono">
              Click to view source excerpt <ExternalLink className="h-2.5 w-2.5" />
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {!onOpenPreview && (
        <SourcePreview
          source={fallbackSource}
          open={internalPreviewOpen}
          onOpenChange={setInternalPreviewOpen}
        />
      )}
    </>
  );
}
