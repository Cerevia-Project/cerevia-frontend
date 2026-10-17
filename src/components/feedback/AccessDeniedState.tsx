import * as React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface AccessDeniedStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  requiredRole?: string;
  onGoBack?: () => void;
  onRequestAccess?: () => void;
}

export function AccessDeniedState({
  title = "Access Restricted",
  description = "You do not have the required permissions to view this resource. Contact your workspace administrator for access.",
  requiredRole,
  onGoBack,
  onRequestAccess,
  className,
  ...props
}: AccessDeniedStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-md border border-border p-6 text-center bg-card/60",
        className
      )}
      {...props}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/10 text-warning mb-3 border border-warning/20">
        <ShieldAlert className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {requiredRole && (
        <span className="mt-1 inline-flex items-center rounded px-2 py-0.5 text-[11px] font-mono font-medium bg-secondary text-muted-foreground border border-border">
          Requires role: {requiredRole}
        </span>
      )}
      <p className="mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
      <div className="mt-5 flex items-center gap-2">
        {onGoBack && (
          <Button size="sm" variant="outline" onClick={onGoBack}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Go back
          </Button>
        )}
        {onRequestAccess && (
          <Button size="sm" variant="default" onClick={onRequestAccess}>
            Request access
          </Button>
        )}
      </div>
    </div>
  );
}
