"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccessDeniedState, EmptyState, QueryBoundary } from "@/components/feedback";
import { AdminNav } from "@/features/admin/AdminNav";
import { usePermission, useSession } from "@/providers/session-provider";
import { usePermissionCatalog, useRoles } from "@/features/admin/api";

/**
 * Roles and the permissions they carry.
 *
 * Roles are defined server-side; this screen reads them rather than editing
 * them, because the API exposes no role mutation.
 */
export function RolesView() {
  const canManage = usePermission("admin:roles");
  const roles = useRoles();
  const catalog = usePermissionCatalog();
  const { roles: myRoles } = useSession();

  if (!canManage) {
    return (
      <div className="space-y-4">
        <AdminNav />
        <AccessDeniedState description="Viewing roles requires the admin:roles permission." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminNav />

      <header>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Roles</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          What each role is permitted to do. The server enforces these; the interface only hides
          what it would refuse.
        </p>
      </header>

      <QueryBoundary
        query={roles}
        errorTitle="Could not load roles"
        isEmpty={(data) => data.items.length === 0}
        empty={<EmptyState title="No roles" description="No role is defined for this organization." />}
      >
        {(data) => (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.items.map((role) => (
              <Card key={role.id}>
                <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4">
                  <CardTitle className="text-sm font-semibold">{role.name}</CardTitle>
                  {myRoles.includes(role.name) && (
                    <Badge variant="secondary" size="sm" className="text-[10px]">
                      Your role
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  {role.permissions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">This role carries no permissions.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-1.5">
                      {role.permissions.map((permission) => (
                        <li key={permission}>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {permission}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </QueryBoundary>

      {catalog.data && catalog.data.items.length > 0 && (
        <Card>
          <CardHeader className="border-b border-border p-4">
            <CardTitle className="text-sm font-semibold">All permissions</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="flex flex-wrap gap-1.5">
              {catalog.data.items.map((permission) => (
                <li key={permission}>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {permission}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
