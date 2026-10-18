"use client";

import { useQuery } from "@tanstack/react-query";
import { companyApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { PageParams } from "@/api/types";

export function useProjects(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => companyApi.listProjects(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => companyApi.getProject(id),
    enabled: Boolean(id),
  });
}

export function useProjectTasks(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.tasks(id),
    queryFn: () => companyApi.getProjectTasks(id),
    enabled: Boolean(id),
  });
}

export function useProjectDependencies(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.projects.dependencies(id),
    queryFn: () => companyApi.getProjectDependencies(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useProjectRisks(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.risks(id),
    queryFn: () => companyApi.getProjectRisks(id),
    enabled: Boolean(id),
  });
}

export function useLaunchReadiness(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.projects.readiness(id),
    queryFn: () => companyApi.getLaunchReadiness(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useRisks(window?: string) {
  return useQuery({
    queryKey: queryKeys.risks(window),
    queryFn: () => companyApi.listRisks(window),
  });
}
