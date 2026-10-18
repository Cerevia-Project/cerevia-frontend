"use client";

import * as React from "react";
import {
  User,
  Users,
  Building2,
  FolderKanban,
  Flag,
  ListChecks,
  Bug,
  FileText,
  CalendarDays,
  Scale,
  Handshake,
  Ticket,
  BookLock,
  Server,
  CircleDot,
  Shapes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EntityType } from "@/api/types";
import { humanize } from "@/lib/formatters";

export interface EntityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Contract entity type. Unknown values render with a neutral fallback. */
  type: EntityType | string;
  label?: string;
  subtitle?: string;
  size?: "sm" | "default" | "lg";
  clickable?: boolean;
  /** Show only the icon, with the type as its accessible name. */
  iconOnly?: boolean;
}

interface TypeConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  styles: string;
}

/**
 * Icon and colour per entity type. `GET /graph/schema` carries the backend's
 * own labels and colour keys; this map is the local rendering of them, and
 * anything it does not know still renders rather than crashing.
 */
const TYPE_CONFIG: Record<EntityType, TypeConfig> = {
  employee: {
    label: "Person",
    icon: User,
    styles: "bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30",
  },
  team: {
    label: "Team",
    icon: Users,
    styles: "bg-violet-500/10 text-violet-800 dark:text-violet-300 border-violet-500/30",
  },
  department: {
    label: "Department",
    icon: Building2,
    styles: "bg-violet-500/10 text-violet-900 dark:text-violet-200 border-violet-500/30",
  },
  project: {
    label: "Project",
    icon: FolderKanban,
    styles: "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30",
  },
  milestone: {
    label: "Milestone",
    icon: Flag,
    styles: "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/30",
  },
  task: {
    label: "Task",
    icon: ListChecks,
    styles: "bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border-cyan-500/30",
  },
  issue: {
    label: "Issue",
    icon: Bug,
    styles: "bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-500/30",
  },
  document: {
    label: "Document",
    icon: FileText,
    styles: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30",
  },
  meeting: {
    label: "Meeting",
    icon: CalendarDays,
    styles: "bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/30",
  },
  decision: {
    label: "Decision",
    icon: Scale,
    styles: "bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-500/30",
  },
  customer: {
    label: "Customer",
    icon: Handshake,
    styles: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
  ticket: {
    label: "Ticket",
    icon: Ticket,
    styles: "bg-orange-500/10 text-orange-900 dark:text-orange-200 border-orange-500/30",
  },
  policy: {
    label: "Policy",
    icon: BookLock,
    styles: "bg-slate-500/10 text-slate-800 dark:text-slate-300 border-slate-500/30",
  },
  system: {
    label: "System",
    icon: Server,
    styles: "bg-zinc-500/10 text-zinc-800 dark:text-zinc-300 border-zinc-500/30",
  },
  action_item: {
    label: "Action item",
    icon: CircleDot,
    styles: "bg-lime-500/10 text-lime-900 dark:text-lime-300 border-lime-500/30",
  },
};

const UNKNOWN_TYPE: TypeConfig = {
  label: "Entity",
  icon: Shapes,
  styles: "bg-secondary text-muted-foreground border-border",
};

export function entityTypeConfig(type: EntityType | string): TypeConfig {
  return TYPE_CONFIG[type as EntityType] ?? { ...UNKNOWN_TYPE, label: humanize(type) };
}

export function entityTypeIcon(type: EntityType | string) {
  return entityTypeConfig(type).icon;
}

export function EntityBadge({
  type,
  label,
  subtitle,
  size = "default",
  clickable = false,
  iconOnly = false,
  className,
  ...props
}: EntityBadgeProps) {
  const config = entityTypeConfig(type);
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

  return (
    <span
      className={cn(
        "inline-flex select-none items-center rounded-md border font-medium transition-all",
        config.styles,
        iconOnly ? "p-1" : sizeClasses[size],
        clickable && "cursor-pointer hover:opacity-80 active:scale-[0.98]",
        className,
      )}
      title={iconOnly ? (label ?? config.label) : undefined}
      {...props}
    >
      <Icon className={cn("shrink-0", iconSizes[size])} aria-hidden="true" />
      {iconOnly ? (
        <span className="sr-only">{label ?? config.label}</span>
      ) : (
        <span className="truncate">{label ?? config.label}</span>
      )}
      {!iconOnly && subtitle && (
        <span className="ml-0.5 border-l border-current/30 pl-1.5 text-[10px] font-normal opacity-70">
          {subtitle}
        </span>
      )}
    </span>
  );
}
