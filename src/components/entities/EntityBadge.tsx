import * as React from "react";
import { User, Users, FolderKanban, Scale, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntityType } from "@/types";

export interface EntityBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  type: EntityType;
  name?: string;
  subtitle?: string;
  size?: "sm" | "default" | "lg";
  clickable?: boolean;
}

const ENTITY_CONFIG: Record<
  EntityType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    styles: string;
  }
> = {
  person: {
    label: "Person",
    icon: User,
    styles: "bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30",
  },
  team: {
    label: "Team",
    icon: Users,
    styles: "bg-violet-500/10 text-violet-800 dark:text-violet-300 border-violet-500/30",
  },
  project: {
    label: "Project",
    icon: FolderKanban,
    styles: "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30",
  },
  decision: {
    label: "Decision",
    icon: Scale,
    styles: "bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-500/30",
  },
  document: {
    label: "Document",
    icon: FileText,
    styles: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30",
  },
};

export function EntityBadge({
  type,
  name,
  subtitle,
  size = "default",
  clickable = false,
  className,
  ...props
}: EntityBadgeProps) {
  const config = ENTITY_CONFIG[type] || ENTITY_CONFIG.document;
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
    <div
      className={cn(
        "inline-flex items-center rounded-md border font-medium transition-all select-none",
        config.styles,
        sizeClasses[size],
        clickable && "cursor-pointer hover:opacity-80 active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <Icon className={cn("shrink-0", iconSizes[size])} />
      <span>{name || config.label}</span>
      {subtitle && (
        <span className="opacity-70 font-normal text-[10px] border-l border-current/30 pl-1.5 ml-0.5">
          {subtitle}
        </span>
      )}
    </div>
  );
}
