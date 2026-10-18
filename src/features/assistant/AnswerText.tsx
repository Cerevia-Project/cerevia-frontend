"use client";

import * as React from "react";
import type { Citation } from "@/api/types";
import { CitationChip } from "@/components/evidence/CitationChip";
import { splitOnCitationMarkers } from "@/lib/citations";

export interface AnswerTextProps {
  text: string;
  citations: Citation[];
  onOpenCitation?: (citation: Citation) => void;
}

/** Model output is rendered as text, never as markup or links. */
export function AnswerText({ text, citations, onOpenCitation }: AnswerTextProps) {
  const parts = React.useMemo(() => splitOnCitationMarkers(text), [text]);

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
      {parts.map((part, index) => {
        if (part.kind === "text") return <React.Fragment key={index}>{part.value}</React.Fragment>;

        const chips = part.indexes
          .map((marker) => ({ marker, citation: citations[marker - 1] }))
          .filter((entry): entry is { marker: number; citation: Citation } =>
            Boolean(entry.citation),
          );

        if (chips.length === 0) {
          return <React.Fragment key={index}>{part.value}</React.Fragment>;
        }

        return (
          <span key={index} className="mx-0.5 inline-flex gap-0.5 align-baseline">
            {chips.map(({ marker, citation }) => (
              <CitationChip
                key={citation.id}
                citation={citation}
                index={marker}
                onOpenPreview={onOpenCitation}
                size="sm"
              />
            ))}
          </span>
        );
      })}
    </p>
  );
}
