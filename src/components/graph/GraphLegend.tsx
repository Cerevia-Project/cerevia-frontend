"use client";

import * as React from "react";
import { graphColor } from "@/components/graph/palette";
import { useTheme } from "next-themes";
import type { EntityTypeMeta } from "@/api/types";

/** Entity-type key for the canvas, driven by `GET /graph/schema`. */
export function GraphLegend({ entityTypes }: { entityTypes: EntityTypeMeta[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (entityTypes.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {entityTypes.map((entityType) => (
        <li key={entityType.type} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            className="h-2.5 w-2.5 rounded-full border border-border"
            style={{ backgroundColor: graphColor(entityType.colorKey, isDark).base }}
            aria-hidden="true"
          />
          {entityType.label}
        </li>
      ))}
    </ul>
  );
}
