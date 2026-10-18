"use client";

import { useQuery } from "@tanstack/react-query";
import { companyApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { DecisionListParams } from "@/api/types";

export function useDecisions(params: DecisionListParams = {}) {
  return useQuery({
    queryKey: queryKeys.decisions.list(params),
    queryFn: () => companyApi.listDecisions(params),
  });
}

export function useDecision(id: string) {
  return useQuery({
    queryKey: queryKeys.decisions.detail(id),
    queryFn: () => companyApi.getDecision(id),
    enabled: Boolean(id),
  });
}

export function useDecisionRevisions(id: string) {
  return useQuery({
    queryKey: queryKeys.decisions.revisions(id),
    queryFn: () => companyApi.getDecisionRevisions(id),
    enabled: Boolean(id),
  });
}

export function useDecisionTrace(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.decisions.trace(id),
    queryFn: () => companyApi.getDecisionTrace(id),
    enabled: Boolean(id) && enabled,
  });
}
