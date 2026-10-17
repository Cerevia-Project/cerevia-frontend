"use client";

import * as React from "react";
import {
  ShieldCheck,
  GitMerge,
  Sparkles,
  AlertTriangle,
  CircleHelp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EvidenceState } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface EvidenceBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  state: EvidenceState;
  showTooltip?: boolean;
  size?: "sm" | "default" | "lg";
  customLabel?: string;
}

const STATE_CONFIG: Record<
  EvidenceState,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    styles: string;
    borderStyle: string;
  }
> = {
  confirmed: {
    label: "Confirmed Fact",
    description: "Directly verified against authoritative organizational documents or official records.",
    icon: ShieldCheck,
    styles:
      "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-semibold",
    borderStyle: "border-solid",
  },
  inferred: {
    label: "Graph Inferred",
    description: "Derived through multi-hop relational synthesis in the FalkorDB knowledge graph.",
    icon: GitMerge,
    styles:
      "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/40 font-medium",
    borderStyle: "border-solid",
  },
  hypothesis: {
    label: "Hypothesis (Possibility)",
    description: "AI-generated possibility or working theory; NOT a confirmed organizational fact.",
    icon: Sparkles,
    styles:
      "bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/50 font-medium",
    borderStyle: "border-dashed border-[1.5px]",
  },
  conflicting: {
    label: "Conflicting Evidence",
    description: "Contradictory or divergent claims detected across two or more organizational records.",
    icon: AlertTriangle,
    styles:
      "bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-500/50 font-medium",
    borderStyle: "border-solid",
  },
  missing: {
    label: "Missing Evidence",
    description: "No supporting documentation or graph nodes found in the knowledge base.",
    icon: CircleHelp,
    styles:
      "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30 font-normal",
    borderStyle: "border-dotted border-[1.5px]",
  },
};

export function EvidenceBadge({
  state,
  showTooltip = true,
  size = "default",
  customLabel,
  className,
  ...props
}: EvidenceBadgeProps) {
  const config = STATE_CONFIG[state] || STATE_CONFIG.missing;
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

  const badgeContent = (
    <div
      className={cn(
        "inline-flex items-center rounded-md border transition-colors select-none",
        config.styles,
        config.borderStyle,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <Icon className={cn("shrink-0", iconSizes[size])} />
      <span>{customLabel || config.label}</span>
      {state === "hypothesis" && (
        <span className="ml-0.5 text-[9px] uppercase tracking-wider opacity-75 font-mono">
          [UNVERIFIED]
        </span>
      )}
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block cursor-help">{badgeContent}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs space-y-1 p-2.5">
          <p className="font-semibold flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-primary" />
            {config.label}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {config.description}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
