"use client";

import * as React from "react";
import {
  FileText,
  ExternalLink,
  Shield,
  Calendar,
  User,
  CheckCircle2,
  FileCode,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import { SourceDocument } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface SourcePreviewProps {
  source?: SourceDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  confluence: FileText,
  google_doc: FileText,
  slack: MessageSquare,
  jira: CheckCircle2,
  github: FileCode,
  pdf: Bookmark,
  markdown: FileCode,
};

export function SourcePreview({
  source,
  open,
  onOpenChange,
}: SourcePreviewProps) {
  if (!source) return null;

  const TypeIcon = TYPE_ICONS[source.type] || FileText;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto flex flex-col">
        <SheetHeader className="text-left space-y-2 pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="uppercase text-[10px] font-mono tracking-wider">
              <TypeIcon className="h-3 w-3 mr-1" />
              {source.type.replace("_", " ")}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {source.id}
            </span>
          </div>
          <SheetTitle className="text-base font-semibold leading-tight text-foreground">
            {source.title}
          </SheetTitle>
          {source.section && (
            <SheetDescription className="text-xs text-muted-foreground">
              Section: {source.section}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="py-4 space-y-5 flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border/60 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Author
              </span>
              <p className="font-medium text-foreground">
                {source.author}
                {source.authorRole && (
                  <span className="block text-[11px] text-muted-foreground font-normal">
                    {source.authorRole}
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Last Modified
              </span>
              <p className="font-medium text-foreground">{source.lastUpdated}</p>
            </div>

            <div className="space-y-1 col-span-2 pt-2 border-t border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Evidence Reliability Score
              </span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${source.reliabilityScore}%` }}
                  />
                </div>
                <span className="font-mono font-medium text-xs text-foreground">
                  {source.reliabilityScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Highlighted Ingested Passage */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ingested Evidence Excerpt
            </h4>
            <div className="p-3.5 rounded-md bg-card border border-border text-xs leading-relaxed text-foreground shadow-xs font-serif">
              {source.highlightedText ? (
                <>
                  <span className="text-muted-foreground">... </span>
                  <mark className="bg-amber-400/20 dark:bg-amber-400/30 text-foreground px-1 py-0.5 rounded font-sans font-medium border border-amber-500/30">
                    {source.highlightedText}
                  </mark>
                  <span className="text-muted-foreground"> ...</span>
                </>
              ) : (
                <p className="italic text-muted-foreground">{source.snippet}</p>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Ingested and mapped to the FalkorDB knowledge graph.
            </p>
          </div>

          <Separator />

          {/* Source Link */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Original Storage Provider
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                if (source.sourceUrl) {
                  window.open(source.sourceUrl, "_blank", "noopener,noreferrer");
                }
              }}
              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
            >
              Open Original Record
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
