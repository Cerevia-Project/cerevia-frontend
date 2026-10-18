import * as React from "react";
import Link from "next/link";
import { FolderSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "default" | "secondary" | "outline";
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-border p-6 text-center bg-card/50",
        className
      )}
      {...props}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground mb-3 border border-border">
        {icon || <FolderSearch className="h-4 w-4" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-4 flex items-center gap-2">
          {action &&
            (action.href ? (
              <Button asChild size="sm" variant={action.variant || "default"}>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button size="sm" variant={action.variant || "default"} onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          {secondaryAction && (
            <Button
              size="sm"
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
