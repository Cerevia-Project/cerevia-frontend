"use client";

import * as React from "react";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccessDeniedState, EmptyState, QueryBoundary } from "@/components/feedback";
import { AdminNav } from "@/features/admin/AdminNav";
import { usePermission } from "@/providers/session-provider";
import { useReplaceSourceAccess, useSourceAccess } from "@/features/admin/api";
import { useSources } from "@/features/sources/api";
import { errorMessage } from "@/api/errors";
import { humanize } from "@/lib/formatters";
import type { AclGrant } from "@/api/types";

type PrincipalType = AclGrant["principalType"];
type Permission = AclGrant["permission"];

const PRINCIPAL_TYPES: PrincipalType[] = ["user", "role", "team"];
const PERMISSIONS: Permission[] = ["read", "write"];

export function AccessView() {
  const canManage = usePermission("admin:sources");
  const sources = useSources();
  const [chosenSourceId, setChosenSourceId] = React.useState<string | null>(null);
  const sourceId = chosenSourceId ?? sources.data?.items[0]?.id ?? null;

  if (!canManage) {
    return (
      <div className="space-y-4">
        <AdminNav />
        <AccessDeniedState description="Editing source access requires the admin:sources permission." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminNav />

      <header>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Source access</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Who can read and write each source. Retrieval and the assistant both respect these
          grants.
        </p>
      </header>

      <QueryBoundary
        query={sources}
        errorTitle="Could not load sources"
        isEmpty={(page) => page.items.length === 0}
        empty={
          <EmptyState
            icon={<KeyRound className="h-4 w-4" />}
            title="No sources"
            description="Create a source before assigning access to it."
          />
        }
      >
        {(page) => (
          <div className="space-y-4">
            <div className="max-w-xs space-y-1.5">
              <Label htmlFor="acl-source" className="text-xs">
                Source
              </Label>
              <Select value={sourceId ?? undefined} onValueChange={setChosenSourceId}>
                <SelectTrigger id="acl-source" className="h-9 text-xs">
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  {page.items.map((source) => (
                    <SelectItem key={source.id} value={source.id} className="text-xs">
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sourceId && <AclEditor sourceId={sourceId} />}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

function AclEditor({ sourceId }: { sourceId: string }) {
  const acl = useSourceAccess(sourceId);
  const replace = useReplaceSourceAccess(sourceId);

  const [grants, setGrants] = React.useState<AclGrant[]>([]);
  const [principalType, setPrincipalType] = React.useState<PrincipalType>("role");
  const [principalId, setPrincipalId] = React.useState("");
  const [permission, setPermission] = React.useState<Permission>("read");

  const [syncedGrants, setSyncedGrants] = React.useState<AclGrant[] | null>(null);
  if (acl.data && acl.data.grants !== syncedGrants) {
    setSyncedGrants(acl.data.grants);
    setGrants(acl.data.grants);
  }

  const isDirty =
    acl.data !== undefined && JSON.stringify(grants) !== JSON.stringify(acl.data.grants);

  const addGrant = () => {
    const trimmed = principalId.trim();
    if (!trimmed) return;
    const exists = grants.some(
      (grant) =>
        grant.principalType === principalType &&
        grant.principalId === trimmed &&
        grant.permission === permission,
    );
    if (exists) {
      toast.info("That grant is already in the list.");
      return;
    }
    setGrants((current) => [...current, { principalType, principalId: trimmed, permission }]);
    setPrincipalId("");
  };

  if (acl.isPending) return <Skeleton className="h-48 w-full rounded-md" />;
  if (acl.isError) {
    return (
      <EmptyState title="Could not load this ACL" description={errorMessage(acl.error)} />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4">
        <CardTitle className="text-sm font-semibold">Grants</CardTitle>
        {isDirty && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setGrants(acl.data.grants)}
            >
              Discard
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              disabled={replace.isPending}
              onClick={() =>
                replace.mutate(grants, { onSuccess: () => toast.success("Access updated.") })
              }
            >
              {replace.isPending ? "Saving…" : "Save access"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {grants.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No grant is recorded. Only roles with an organization-wide permission can read this
            source.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] hover:bg-transparent">
                <TableHead className="w-[110px]">Principal</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead className="w-[110px]">Permission</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {grants.map((grant, index) => (
                <TableRow key={`${grant.principalType}-${grant.principalId}-${grant.permission}`}>
                  <TableCell className="text-muted-foreground">
                    {humanize(grant.principalType)}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-foreground">
                    {grant.principalId}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {humanize(grant.permission)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${grant.principalType} ${grant.principalId}`}
                      onClick={() =>
                        setGrants((current) => current.filter((_, position) => position !== index))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="principal-type" className="text-xs">
              Principal
            </Label>
            <Select
              value={principalType}
              onValueChange={(value) => setPrincipalType(value as PrincipalType)}
            >
              <SelectTrigger id="principal-type" className="h-8 w-[110px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRINCIPAL_TYPES.map((value) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {humanize(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="principal-id" className="text-xs">
              Identifier
            </Label>
            <Input
              id="principal-id"
              value={principalId}
              onChange={(event) => setPrincipalId(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addGrant();
                }
              }}
              placeholder="role name, user id or team id"
              className="h-8 w-56 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="grant-permission" className="text-xs">
              Permission
            </Label>
            <Select value={permission} onValueChange={(value) => setPermission(value as Permission)}>
              <SelectTrigger id="grant-permission" className="h-8 w-[110px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERMISSIONS.map((value) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {humanize(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={!principalId.trim()}
            onClick={addGrant}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add grant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
