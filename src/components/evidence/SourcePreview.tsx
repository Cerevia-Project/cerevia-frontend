"use client";

import * as React from "react";
import { FileText, Hash, Layers, BadgeCheck, AlertCircle } from "lucide-react";
import type { Citation } from "@/api/types";
import { useDocumentContent } from "@/features/sources/api";
import { errorMessage } from "@/api/errors";
import { humanize } from "@/lib/formatters";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export interface SourcePreviewProps {
  citation: Citation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Non-colour cue for approval state, alongside the badge colour. */
const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  approved: BadgeCheck,
  draft: FileText,
  superseded: AlertCircle,
  unknown: AlertCircle,
};

/**
 * The passage behind a citation, with the surrounding document text when the
 * chunk can be fetched.
 *
 * Document text is untrusted: it is rendered as text, never as markup, and
 * nothing in it is turned into a link.
 */
export function SourcePreview({ citation, open, onOpenChange }: SourcePreviewProps) {
  const content = useDocumentContent(open && citation ? citation.documentId : null, citation?.chunkId);

  if (!citation) return null;

  const StatusIcon = STATUS_ICON[citation.sourceStatus] ?? AlertCircle;
  const location = [
    citation.section ? `Section ${citation.section}` : null,
    citation.page !== null && citation.page !== undefined ? `Page ${citation.page}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto flex flex-col">
        <SheetHeader className="text-left space-y-2 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="uppercase text-[10px] font-mono tracking-wider">
              <FileText className="h-3 w-3 mr-1" aria-hidden="true" />
              {citation.sourceType}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono">
              <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
              {humanize(citation.sourceStatus)}
            </Badge>
            <span className="font-mono text-[10px] text-muted-foreground">
              v{citation.documentVersion}
            </span>
          </div>
          <SheetTitle className="text-base font-semibold leading-tight text-foreground">
            {citation.documentTitle}
          </SheetTitle>
          {location && (
            <SheetDescription className="text-xs text-muted-foreground">{location}</SheetDescription>
          )}
        </SheetHeader>

        <div className="py-2 space-y-5 flex-1">
          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs">
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="h-3.5 w-3.5" aria-hidden="true" /> Document
              </dt>
              <dd className="font-mono text-[11px] break-all text-foreground">
                {citation.documentId}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" /> Chunk
              </dt>
              <dd className="font-mono text-[11px] break-all text-foreground">{citation.chunkId}</dd>
            </div>
          </dl>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cited passage
            </h3>
            <blockquote className="rounded-md border border-border bg-card p-3.5 text-xs leading-relaxed text-foreground shadow-xs">
              <mark className="rounded border border-amber-500/30 bg-amber-400/20 px-1 py-0.5 font-medium text-foreground dark:bg-amber-400/30">
                {citation.passage}
              </mark>
            </blockquote>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Source text
            </h3>
            {content.isPending && (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
              </div>
            )}
            {content.isError && (
              <p className="text-[11px] text-muted-foreground">
                The source text could not be loaded: {errorMessage(content.error)}
              </p>
            )}
            {content.data && (
              <p className="whitespace-pre-wrap rounded-md border border-border/60 bg-muted/30 p-3 text-[11px] leading-relaxed text-foreground">
                {content.data.content}
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
