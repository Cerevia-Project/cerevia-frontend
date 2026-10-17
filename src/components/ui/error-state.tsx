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
  title = "Failed to load knowledge data",
  message = "An unexpected error occurred while communicating with the knowledge graph service. Please try again.",
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
        "flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-4 ring-destructive/10 mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          {title}
        </h3>
        {code && (
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border">
            {code}
          </span>
        )}
      </div>
      <p className="mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-5">
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            isLoading={isRetrying}
            loadingText="Retrying..."
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            {retryText}
          </Button>
        </div>
      )}
    </div>
  );
}
