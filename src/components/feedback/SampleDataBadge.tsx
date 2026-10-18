"use client";

import * as React from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

export function SampleDataBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground",
        className,
      )}
      title="This record comes from the demonstration dataset."
      {...props}
    >
      <FlaskConical className="h-2.5 w-2.5" aria-hidden="true" />
      Demo
    </span>
  );
}
