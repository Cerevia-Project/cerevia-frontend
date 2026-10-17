import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface LoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  subtext?: string;
  variant?: "spinner" | "skeleton";
}

export function LoadingState({
  message = "Loading knowledge records...",
  subtext,
  variant = "spinner",
  className,
  ...props
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3 p-4", className)} {...props}>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[160px] flex-col items-center justify-center p-6 text-center",
        className
      )}
      {...props}
    >
      <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)] mb-2.5" />
      <p className="text-xs font-medium text-foreground">{message}</p>
      {subtext && (
        <p className="mt-0.5 text-[11px] text-muted-foreground font-mono">
          {subtext}
        </p>
      )}
    </div>
  );
}
