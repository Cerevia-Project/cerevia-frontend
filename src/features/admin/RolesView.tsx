"use client";

import * as React from "react";
import { ShieldCheck, Check, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RolePerm {
  permission: string;
  admin: boolean;
  steward: boolean;
  explorer: boolean;
  auditor: boolean;
}

const PERMISSIONS_MATRIX: RolePerm[] = [
  {
    permission: "Traverse Knowledge Graph (Read)",
    admin: true,
    steward: true,
    explorer: true,
    auditor: true,
  },
  {
    permission: "Ask AI Assistant & View Citations",
    admin: true,
    steward: true,
    explorer: true,
    auditor: true,
  },
  {
    permission: "Submit & Edit ADR Decisions",
    admin: true,
    steward: true,
    explorer: false,
    auditor: false,
  },
  {
    permission: "Approve Evidence Consensus Proposals",
    admin: true,
    steward: true,
    explorer: false,
    auditor: false,
  },
  {
    permission: "Configure Data Connectors & Ingestion",
    admin: true,
    steward: false,
    explorer: false,
    auditor: false,
  },
  {
    permission: "Inspect Multi-Tenant Audit Trail",
    admin: true,
    steward: false,
    explorer: false,
    auditor: true,
  },
];

export function RolesView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Roles &amp; Permissions Matrix
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              RBAC Enabled
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Granular access controls governing graph traversals, decision approvals, and connector ingestion.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] hover:bg-transparent">
                <TableHead>Capability / Permission</TableHead>
                <TableHead className="text-center w-28">Admin</TableHead>
                <TableHead className="text-center w-36">Knowledge Steward</TableHead>
                <TableHead className="text-center w-32">Graph Explorer</TableHead>
                <TableHead className="text-center w-28">Auditor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {PERMISSIONS_MATRIX.map((perm, idx) => (
                <TableRow key={idx} className="hover:bg-secondary/40">
                  <TableCell className="font-medium text-foreground">{perm.permission}</TableCell>
                  <TableCell className="text-center">
                    {perm.admin ? <Check className="h-4 w-4 text-success mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {perm.steward ? <Check className="h-4 w-4 text-success mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {perm.explorer ? <Check className="h-4 w-4 text-success mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {perm.auditor ? <Check className="h-4 w-4 text-success mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
