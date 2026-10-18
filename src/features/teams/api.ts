"use client";

import { useQuery } from "@tanstack/react-query";
import { companyApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { PageParams } from "@/api/types";

export function useTeams(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.teams.list(params),
    queryFn: () => companyApi.listTeams(params),
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: queryKeys.teams.detail(id),
    queryFn: () => companyApi.getTeam(id),
    enabled: Boolean(id),
  });
}
