"use client";

import * as React from "react";
import { FlaskConical } from "lucide-react";
import { useOverview } from "@/features/overview/api";

/**
 * Persistent notice that the workspace is showing the demonstration dataset.
 *
 * Driven by `sampleDataNotice` from `GET /overview`, so it disappears on its
 * own once real data is the only thing in the organization.
 */
export function SampleDataBanner() {
  const { data } = useOverview();

  if (!data?.sampleDataNotice) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[11px] text-amber-900 dark:text-amber-200"
    >
      <FlaskConical className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>
        Demonstration data: this workspace contains a synthetic dataset loaded for evaluation.
      </span>
    </div>
  );
}
