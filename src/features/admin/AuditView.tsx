"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: "success" | "blocked";
  latency: string;
}

const MOCK_AUDIT_LOGS: AuditEntry[] = [
  {
    id: "aud-901",
    timestamp: "2026-10-17 10:14:02 UTC",
    actor: "habib@cerevia.internal",
    action: "GraphCypherTraversal",
    target: "(:Decision)-[:governedBy]->(:Project)",
    status: "success",
    latency: "11ms",
  },
  {
    id: "aud-902",
    timestamp: "2026-10-17 09:42:15 UTC",
    actor: "cerevia-assistant-worker",
    action: "VectorEmbeddingQuery",
    target: "doc-arch-001 §3.2",
    status: "success",
    latency: "8ms",
  },
  {
    id: "aud-903",
    timestamp: "2026-10-17 08:30:19 UTC",
    actor: "devon.vance@cerevia.internal",
    action: "ApproveActionProposal",
    target: "ACT-02 (FalkorDB Memory 64GB)",
    status: "success",
    latency: "24ms",
  },
  {
    id: "aud-904",
    timestamp: "2026-10-16 19:12:44 UTC",
    actor: "unauthorized-client-ip",
    action: "DirectCypherQuery",
    target: "MATCH (n:Person) RETURN n",
    status: "blocked",
    latency: "2ms",
  },
];

export function AuditView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Security &amp; Traversal Audit Trail
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              SOC-2 Type II Certified
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable log of all FalkorDB knowledge traversals, assistant syntheses, and role actions.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] hover:bg-transparent">
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Target Entity / Cypher</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Execution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {MOCK_AUDIT_LOGS.map((log) => (
                <TableRow key={log.id} className="hover:bg-secondary/40 font-mono text-[11px]">
                  <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell className="text-foreground">{log.actor}</TableCell>
                  <TableCell className="font-medium text-foreground">{log.action}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{log.target}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                        log.status === "success"
                          ? "bg-success/10 text-success border border-success/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}
                    >
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{log.latency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
