"use client";

import * as React from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "@/api/errors";
import { AccessDeniedState } from "@/components/feedback/AccessDeniedState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";

export interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
  /** Shown while loading. Defaults to layout-shaped skeleton rows. */
  skeleton?: React.ReactNode;
  /** Rows the skeleton stands in for, when the default skeleton is used. */
  skeletonRows?: number;
  /** Decides whether the loaded data is "nothing to show". */
  isEmpty?: (data: T) => boolean;
  empty?: React.ReactNode;
  errorTitle?: string;
  /** Copy for a 404, which the API also returns when access is denied. */
  notFoundTitle?: string;
  notFoundDescription?: string;
}

/**
 * Renders the four states every API-backed view has: loading, failed,
 * forbidden/not-found, and loaded. Keeping it in one place is what stops
 * screens from inventing their own error handling.
 */
export function QueryBoundary<T>({
  query,
  children,
  skeleton,
  skeletonRows = 3,
  isEmpty,
  empty,
  errorTitle,
  notFoundTitle = "Not available",
  notFoundDescription = "This record does not exist, or it is outside your access.",
}: QueryBoundaryProps<T>) {
  if (query.isPending) {
    return (
      <>
        {skeleton ?? (
          <div className="space-y-2" aria-busy="true" aria-live="polite">
            {Array.from({ length: skeletonRows }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-md" />
            ))}
            <span className="sr-only">Loading</span>
          </div>
        )}
      </>
    );
  }

  if (query.isError) {
    const error = query.error;

    if (error instanceof ApiError && error.isForbidden) {
      return <AccessDeniedState description={error.detail} />;
    }

    if (error instanceof ApiError && error.isNotFound) {
      return <EmptyState title={notFoundTitle} description={notFoundDescription} />;
    }

    return (
      <ErrorState
        title={errorTitle ?? "Could not load this view"}
        message={error instanceof Error ? error.message : "The request failed."}
        code={error instanceof ApiError ? error.requestId : undefined}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
      />
    );
  }

  const data = query.data as T;
  if (isEmpty?.(data) && empty) {
    return <>{empty}</>;
  }

  return <>{children(data)}</>;
}
