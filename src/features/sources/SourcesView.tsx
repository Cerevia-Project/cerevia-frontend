"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_INGESTION_JOBS, IngestionJob } from "@/mocks/sources";
import { toast } from "sonner";

export function SourcesView() {
  const [jobs, setJobs] = React.useState<IngestionJob[]>(MOCK_INGESTION_JOBS);
  const [syncingId, setSyncingId] = React.useState<string | null>(null);

  const handleSync = (jobId: string) => {
    setSyncingId(jobId);
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "synced", lastSync: "Just now" } : j))
      );
      setSyncingId(null);
      toast.success("Ingestion job completed successfully.");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Knowledge Ingestion Sources
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              {jobs.length} Connectors Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time connectors syncing enterprise docs, chats, and code into FalkorDB and vector memory.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1.5"
          onClick={() => {
            toast.success("Triggered re-indexing across all active connectors.");
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync All
        </Button>
      </div>

      {/* Sources Table Card */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] hover:bg-transparent">
                <TableHead>Connector Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Docs Indexed</TableHead>
                <TableHead className="text-right">Entities Extracted</TableHead>
                <TableHead>Sync Interval</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {jobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-secondary/40">
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/sources/${job.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {job.sourceName}
                      </Link>
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">
                        {job.connectorType}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono capitalize ${
                        job.status === "synced"
                          ? "text-success border-success/30 bg-success/5"
                          : job.status === "syncing" || syncingId === job.id
                          ? "text-primary border-primary/30 bg-primary/5"
                          : "text-muted-foreground"
                      }`}
                    >
                      {syncingId === job.id ? "syncing..." : job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[11px]">
                    {job.documentCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[11px]">
                    {job.entitiesExtracted.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {job.syncInterval}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {job.lastSync}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Run Sync"
                        onClick={() => handleSync(job.id)}
                        disabled={syncingId === job.id}
                      >
                        <RefreshCw className={`h-3 w-3 ${syncingId === job.id ? "animate-spin" : ""}`} />
                      </Button>
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                        <Link href={`/sources/${job.id}`}>
                          Details <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
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
