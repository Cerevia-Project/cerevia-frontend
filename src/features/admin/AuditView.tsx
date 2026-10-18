"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAdminAudit } from "@/features/admin/api";
import { formatDateTime, humanize } from "@/lib/formatters";

/** Searchable audit log: who did what, to which resource, and when. */
export function AuditView() {
  const canRead = usePermission("admin:audit");
  const [actor, setActor] = React.useState("");
  const [action, setAction] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [filters, setFilters] = React.useState<{
    actor?: string;
    action?: string;
    from?: string;
    to?: string;
  }>({});

  // Typing should not fire a request per keystroke.
  React.useEffect(() => {
    const timer = setTimeout(
      () =>
        setFilters({
          actor: actor.trim() || undefined,
          action: action.trim() || undefined,
          from: from ? new Date(from).toISOString() : undefined,
          to: to ? new Date(to).toISOString() : undefined,
        }),
      350,
    );
    return () => clearTimeout(timer);
  }, [actor, action, from, to]);

  const query = useAdminAudit({ ...filters, limit: 100 });

  if (!canRead) {
    return (
      <div className="space-y-4">
        <AdminNav />
        <AccessDeniedState description="Reading the audit log requires the admin:audit permission." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminNav />

      <header>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Audit log</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Every privileged action, as the server recorded it.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="audit-actor" className="text-xs">
            Actor
          </Label>
          <Input
            id="audit-actor"
            value={actor}
            onChange={(event) => setActor(event.target.value)}
            placeholder="user id or email"
            className="h-8 w-48 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-action" className="text-xs">
            Action
          </Label>
          <Input
            id="audit-action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
            placeholder="proposal.approve"
            className="h-8 w-48 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-from" className="text-xs">
            From
          </Label>
          <Input
            id="audit-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="h-8 w-40 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-to" className="text-xs">
            To
          </Label>
          <Input
            id="audit-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="h-8 w-40 text-xs"
          />
        </div>
      </div>

      <QueryBoundary
        query={query}
        errorTitle="Could not load the audit log"
        isEmpty={(page) => page.items.length === 0}
        empty={
          <EmptyState
            title="No audit records"
            description="Nothing matches these filters."
          />
        }
      >
        {(page) => (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px] hover:bg-transparent">
                    <TableHead className="w-[190px]">When</TableHead>
                    <TableHead className="w-[180px]">Actor</TableHead>
                    <TableHead className="w-[180px]">Action</TableHead>
                    <TableHead>Resource</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {page.items.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {formatDateTime(record.timestamp)}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-foreground">
                        {record.actor}
                      </TableCell>
                      <TableCell className="text-foreground">{humanize(record.action)}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {record.resourceType}
                        {record.resourceId ? ` · ${record.resourceId}` : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </QueryBoundary>
    </div>
  );
}
