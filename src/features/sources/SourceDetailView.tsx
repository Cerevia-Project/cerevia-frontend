"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_INGESTION_JOBS } from "@/mocks/sources";
import { toast } from "sonner";

export function SourceDetailView({ jobId }: { jobId: string }) {
  const job = MOCK_INGESTION_JOBS.find((j) => j.id === jobId) || MOCK_INGESTION_JOBS[0];
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Incremental sync completed.");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/sources">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Ingestion Sources
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border uppercase">
              {job.connectorType}
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {job.sourceName}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {job.details || "Continuous ingestion pipeline with automated chunking and PII token filtering."}
          </p>
        </div>

        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSync} disabled={isSyncing}>
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">Sync Status</span>
          <p className="font-semibold text-foreground capitalize flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" /> {job.status}
          </p>
        </Card>
        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">Documents Indexed</span>
          <p className="font-mono font-semibold text-foreground">{job.documentCount.toLocaleString()}</p>
        </Card>
        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">Entities Extracted</span>
          <p className="font-mono font-semibold text-foreground">{job.entitiesExtracted.toLocaleString()}</p>
        </Card>
        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">Reliability Score</span>
          <p className="font-mono font-semibold text-success">{job.reliability}%</p>
        </Card>
      </div>

      {/* Sync Execution Logs */}
      <Card>
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Recent Ingestion Log</CardTitle>
          <span className="font-mono text-[11px] text-muted-foreground">Worker: ing-worker-us-east-1a</span>
        </CardHeader>
        <CardContent className="p-4 space-y-2 font-mono text-[11px] bg-background/50 rounded-b-md">
          <div className="text-muted-foreground">
            [10:14:02 UTC] Ingestion worker initialized for connector {job.id}
          </div>
          <div className="text-muted-foreground">
            [10:14:03 UTC] Pulled 42 modified documents since watermark
          </div>
          <div className="text-muted-foreground">
            [10:14:04 UTC] Presidio PII redaction pass: 0 leaks identified, 3 emails masked
          </div>
          <div className="text-foreground">
            [10:14:05 UTC] Extracted 128 new relationships; dispatched Cypher batch commit to FalkorDB
          </div>
          <div className="text-success font-semibold">
            [10:14:06 UTC] Pipeline commit succeeded. Index updated in 420ms.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
