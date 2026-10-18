"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { AclGrant, AuditListParams } from "@/api/types";

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: adminApi.listUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.admin.roles,
    queryFn: adminApi.listRoles,
  });
}

export function usePermissionCatalog() {
  return useQuery({
    queryKey: queryKeys.admin.permissions,
    queryFn: adminApi.listPermissions,
    staleTime: 10 * 60_000,
  });
}

export function useOrganization() {
  return useQuery({
    queryKey: queryKeys.admin.organization,
    queryFn: adminApi.getOrganization,
    staleTime: 10 * 60_000,
  });
}

export function useSourceAccess(sourceId: string | null) {
  return useQuery({
    queryKey: queryKeys.sources.access(sourceId ?? ""),
    queryFn: () => adminApi.getSourceAccess(sourceId as string),
    enabled: Boolean(sourceId),
  });
}

export function useReplaceSourceAccess(sourceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (grants: AclGrant[]) => adminApi.replaceSourceAccess(sourceId, grants),
    onSuccess: (acl) => {
      queryClient.setQueryData(queryKeys.sources.access(sourceId), acl);
    },
  });
}

export function useAdminAudit(params: AuditListParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.audit(params),
    queryFn: () => adminApi.listAdminAudit(params),
  });
}

export function useAuditRecords(params: AuditListParams = {}) {
  return useQuery({
    queryKey: queryKeys.audit(params),
    queryFn: () => adminApi.listAuditRecords(params),
  });
}
