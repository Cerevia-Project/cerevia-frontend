"use client";

import { useQuery } from "@tanstack/react-query";
import { companyApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { PageParams } from "@/api/types";

export function usePeople(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.people.list(params),
    queryFn: () => companyApi.listPeople(params),
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: queryKeys.people.detail(id),
    queryFn: () => companyApi.getPerson(id),
    enabled: Boolean(id),
  });
}

/** Ranked people for a topic. Disabled until the topic is worth a request. */
export function useExpertiseSearch(topic: string) {
  const trimmed = topic.trim();
  return useQuery({
    queryKey: queryKeys.people.expertise(trimmed),
    queryFn: () => companyApi.searchExpertise(trimmed),
    enabled: trimmed.length > 1,
  });
}
