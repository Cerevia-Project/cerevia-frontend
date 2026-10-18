"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { ConflictListParams, ConflictStatus } from "@/api/types";

export function useConflicts(params: ConflictListParams = {}) {
  return useQuery({
    queryKey: queryKeys.conflicts.list(params),
    queryFn: () => companyApi.listConflicts(params),
  });
}

export function useConflict(id: string) {
  return useQuery({
    queryKey: queryKeys.conflicts.detail(id),
    queryFn: () => companyApi.getConflict(id),
    enabled: Boolean(id),
  });
}

/** Reviewer controls. Gated on `conflicts:resolve` by the server. */
export function useReviewConflict(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { status?: ConflictStatus; note?: string }) =>
      companyApi.reviewConflict(id, body),
    onSuccess: (conflict) => {
      queryClient.setQueryData(queryKeys.conflicts.detail(id), conflict);
      void queryClient.invalidateQueries({ queryKey: queryKeys.conflicts.all });
    },
  });
}
