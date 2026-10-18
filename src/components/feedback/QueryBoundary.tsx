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
  skeleton?: React.ReactNode;
  skeletonRows?: number;
  isEmpty?: (data: T) => boolean;
  empty?: React.ReactNode;
  errorTitle?: string;
  notFoundTitle?: string;
  notFoundDescription?: string;
}

/** Loading, failed, forbidden/not-found, empty and loaded states for one query. */
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
