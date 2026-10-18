import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  code?: string | number;
  onRetry?: () => void;
  retryText?: string;
  isRetrying?: boolean;
}

export function ErrorState({
  title = "Could not load this view",
  message = "Something went wrong while loading this. Try again.",
  code,
  onRetry,
  retryText = "Retry Request",
  isRetrying = false,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-md border border-[var(--destructive-border)] bg-[var(--destructive-subtle)] p-6 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-card text-[var(--destructive)] border border-[var(--destructive-border)] mb-3">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">
          {title}
        </h3>
        {code && (
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-card text-muted-foreground border border-border">
            {code}
          </span>
        )}
      </div>
      <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            isLoading={isRetrying}
            loadingText="Retrying..."
            leftIcon={<RefreshCw className="h-3 w-3" />}
          >
            {retryText}
          </Button>
        </div>
      )}
    </div>
  );
}
