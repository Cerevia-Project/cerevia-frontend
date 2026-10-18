"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import type { Provenance } from "@/api/types";
import { formatDate, formatPercent, humanize } from "@/lib/formatters";

/**
 * Where a fact came from: document, version, passage, confidence and how it
 * was extracted. Passages are rendered as text and never linked.
 */
export function ProvenanceList({ provenance }: { provenance: Provenance[] }) {
  if (provenance.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground">
        No source passage is recorded for this record.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {provenance.map((entry, index) => {
        const location = [
          entry.section ? `Section ${entry.section}` : null,
          entry.page !== null && entry.page !== undefined ? `Page ${entry.page}` : null,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li
            key={`${entry.documentId}-${entry.chunkId}-${index}`}
            className="rounded-md border border-border/60 bg-muted/30 p-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <FileText className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate font-mono text-[10px] text-foreground">
                  {entry.documentId} v{entry.documentVersion}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                {formatPercent(entry.confidence)}
              </span>
            </div>

            {location && (
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{location}</p>
            )}

            <blockquote className="mt-1.5 border-l-2 border-border pl-2 text-[11px] leading-relaxed text-foreground">
              {entry.passage}
            </blockquote>

            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
              {humanize(entry.extractionMethod)} · {formatDate(entry.recordedAt)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
