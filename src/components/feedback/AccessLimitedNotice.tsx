"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Neutral notice that some material was out of reach for this answer.
 *
 * It deliberately says nothing about what was withheld - naming it would leak
 * the very thing the permission check is protecting.
 */
export function AccessLimitedNotice({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-md border border-border bg-muted/40 p-2.5",
        className,
      )}
      {...props}
    >
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Some information could not be used for this answer because it is outside your access.
      </p>
    </div>
  );
}
