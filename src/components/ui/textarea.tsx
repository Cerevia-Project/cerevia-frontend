"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  wrapperClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      description,
      error,
      id,
      required,
      wrapperClassName,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const hasError = Boolean(error);

    const textareaElement = (
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          hasError &&
            "border-destructive focus-visible:ring-destructive/40 text-destructive placeholder:text-destructive/50",
          className
        )}
        ref={ref}
        aria-invalid={hasError ? "true" : undefined}
        aria-describedby={
          hasError
            ? `${textareaId}-error`
            : description
            ? `${textareaId}-desc`
            : undefined
        }
        required={required}
        {...props}
      />
    );

    if (!label && !description && !error) {
      return textareaElement;
    }

    return (
      <div className={cn("space-y-1.5 w-full", wrapperClassName)}>
        {label && (
          <Label htmlFor={textareaId} required={required}>
            {label}
          </Label>
        )}
        {textareaElement}
        {description && !error && (
          <p id={`${textareaId}-desc`} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-xs font-medium text-destructive animate-in fade-in-50"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
