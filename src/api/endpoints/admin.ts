/** Administration: users, roles, permissions, source ACLs, org and audit. */

import { api } from "@/api/client";
import type {
  AclGrant,
  AuditListParams,
  AuditRecord,
  Organization,
  Page,
  Role,
  SourceAcl,
  User,
} from "@/api/types";

export function listUsers(): Promise<{ items: User[] }> {
  return api.get<{ items: User[] }>("/api/v1/admin/users");
}

export function createUser(body: { email: string; name: string }): Promise<User> {
  return api.post<User>("/api/v1/admin/users", body);
}

export function listRoles(): Promise<{ items: Role[] }> {
  return api.get<{ items: Role[] }>("/api/v1/admin/roles");
}

export function listPermissions(): Promise<{ items: string[] }> {
  return api.get<{ items: string[] }>("/api/v1/admin/permissions");
}

export function getSourceAccess(sourceId: string): Promise<SourceAcl> {
  return api.get<SourceAcl>(`/api/v1/admin/sources/${encodeURIComponent(sourceId)}/access`);
}

export function replaceSourceAccess(sourceId: string, grants: AclGrant[]): Promise<SourceAcl> {
  return api.put<SourceAcl>(`/api/v1/admin/sources/${encodeURIComponent(sourceId)}/access`, {
    grants,
  });
}

export function getOrganization(): Promise<Organization> {
  return api.get<Organization>("/api/v1/admin/organization");
}

/** Admin audit view. `listAuditRecords` is the non-admin auditor view. */
export function listAdminAudit(params: AuditListParams = {}): Promise<Page<AuditRecord>> {
  return api.get<Page<AuditRecord>>("/api/v1/admin/audit", { params: { ...params } });
}

export function listAuditRecords(params: AuditListParams = {}): Promise<Page<AuditRecord>> {
  return api.get<Page<AuditRecord>>("/api/v1/audit", { params: { ...params } });
}
