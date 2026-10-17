import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface LoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  subtext?: string;
  variant?: "spinner" | "skeleton" | "card";
}

export function LoadingState({
  message = "Retrieving knowledge graph records...",
  subtext = "Querying FalkorDB multi-hop relational nodes",
  variant = "spinner",
  className,
  ...props
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4 p-4", className)} {...props}>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-md" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="relative mb-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="absolute inset-0 h-8 w-8 rounded-full border border-primary/20 animate-ping opacity-40" />
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      {subtext && (
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          {subtext}
        </p>
      )}
    </div>
  );
}
