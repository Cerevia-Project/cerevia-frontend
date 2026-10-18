"use client";

import { useQuery } from "@tanstack/react-query";
import { overviewApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";

export function useOverview() {
  return useQuery({
    queryKey: queryKeys.overview,
    queryFn: overviewApi.getOverview,
  });
}
