"use client";

import * as React from "react";
import { ShieldCheck, GitMerge, Sparkles, AlertTriangle, CircleHelp, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvidenceKind } from "@/api/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface EvidenceBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  kind: EvidenceKind | string;
  showTooltip?: boolean;
  size?: "sm" | "default" | "lg";
  customLabel?: string;
}

interface KindConfig {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  styles: string;
  borderStyle: string;
}

const KIND_CONFIG: Record<EvidenceKind, KindConfig> = {
  confirmed: {
    label: "Confirmed",
    description: "Stated directly by a cited source document.",
    icon: ShieldCheck,
    styles:
      "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-semibold",
    borderStyle: "border-solid",
  },
  inferred: {
    label: "Inferred",
    description: "Derived by following relationships in the knowledge graph.",
    icon: GitMerge,
    styles: "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/40 font-medium",
    borderStyle: "border-solid",
  },
  hypothesis: {
    label: "Possible explanation",
    description: "A hypothesis, not an established fact. Treat it as unverified.",
    icon: Sparkles,
    styles: "bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/50 font-medium",
    borderStyle: "border-dashed border-[1.5px]",
  },
  conflicting: {
    label: "Conflicting",
    description: "Sources disagree. Neither side is presented as correct here.",
    icon: AlertTriangle,
    styles: "bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-500/50 font-medium",
    borderStyle: "border-solid",
  },
  missing: {
    label: "Missing",
    description: "No supporting evidence was found for this statement.",
    icon: CircleHelp,
    styles: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30 font-normal",
    borderStyle: "border-dotted border-[1.5px]",
  },
};

const UNKNOWN_KIND: KindConfig = {
  label: "Unclassified",
  description: "This evidence kind is not known to this version of the interface.",
  icon: Circle,
  styles: "bg-secondary text-muted-foreground border-border font-normal",
  borderStyle: "border-solid",
};

export function evidenceKindLabel(kind: EvidenceKind | string): string {
  return (KIND_CONFIG[kind as EvidenceKind] ?? UNKNOWN_KIND).label;
}

export function EvidenceBadge({
  kind,
  showTooltip = true,
  size = "default",
  customLabel,
  className,
  ...props
}: EvidenceBadgeProps) {
  const config = KIND_CONFIG[kind as EvidenceKind] ?? UNKNOWN_KIND;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    default: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  const badge = (
    <div
      className={cn(
        "inline-flex items-center rounded-md border transition-colors select-none",
        config.styles,
        config.borderStyle,
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <Icon className={cn("shrink-0", iconSizes[size])} aria-hidden="true" />
      <span>{customLabel ?? config.label}</span>
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block cursor-help">{badge}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs space-y-1 p-2.5">
          <p className="font-semibold flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {config.label}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
