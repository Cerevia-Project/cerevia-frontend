"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { usePermission } from "@/providers/session-provider";
import { useIngestionJob, useRetryIngestionJob } from "@/features/sources/api";
import { formatDateTime, formatPercent, humanize } from "@/lib/formatters";
import type { IngestionJob } from "@/api/types";

const STAGES = ["validating", "extracting", "embedding", "graphing"] as const;

export function SourceDetailView({ jobId }: { jobId: string }) {
  const query = useIngestionJob(jobId);
  const retry = useRetryIngestionJob();
  const canRetry = usePermission("sources:upload");

  return (
    <div className="max-w-4xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
        <Link href="/sources">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Back to knowledge sources
        </Link>
      </Button>

      <QueryBoundary
        query={query}
        errorTitle="Could not load this ingestion job"
        notFoundTitle="Ingestion job not found"
        notFoundDescription="This job does not exist, or it is outside your access."
      >
        {(job) => (
          <div className="space-y-6">
            <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-mono text-base font-semibold tracking-tight text-foreground">
                    {job.id}
                  </h1>
                  <StatusBadge job={job} />
                  {job.isSampleData && <SampleDataBadge />}
                </div>
                <p className="text-xs text-muted-foreground">
                  Source{" "}
                  <span className="font-mono text-foreground">{job.sourceId}</span>
                  {job.documentId && (
                    <>
                      {" · document "}
                      <span className="font-mono text-foreground">{job.documentId}</span>
                    </>
                  )}
                </p>
              </div>

              {job.status === "failed" && canRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  disabled={retry.isPending}
                  onClick={() =>
                    retry.mutate(job.id, {
                      onSuccess: () => toast.success("Retry queued."),
                    })
                  }
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  {retry.isPending ? "Retrying…" : "Retry ingestion"}
                </Button>
              )}
            </header>

            {job.error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-[var(--destructive-border)] bg-[var(--destructive-subtle)] p-3"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--destructive)]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Ingestion failed</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {job.error}
                  </p>
                </div>
              </div>
            )}

            <Card>
              <CardHeader className="border-b border-border p-4">
                <CardTitle className="text-sm font-semibold">Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <StageProgress job={job} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-border p-4">
                <CardTitle className="text-sm font-semibold">Job detail</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                  <Field label="Status" value={humanize(job.status)} />
                  <Field label="Stage" value={humanize(job.stage)} />
                  <Field
                    label="Progress"
                    value={job.progress === undefined ? "-" : formatPercent(job.progress)}
                  />
                  <Field label="Created" value={formatDateTime(job.createdAt)} />
                  {job.updatedAt && <Field label="Updated" value={formatDateTime(job.updatedAt)} />}
                </dl>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

function StatusBadge({ job }: { job: IngestionJob }) {
  const styles: Record<string, string> = {
    queued: "text-muted-foreground",
    running: "text-primary border-primary/30 bg-primary/5",
    done: "text-success border-success/30 bg-success/5",
    failed:
      "text-[var(--destructive)] border-[var(--destructive-border)] bg-[var(--destructive-subtle)]",
  };

  return (
    <Badge variant="outline" className={`text-[10px] ${styles[job.status] ?? ""}`}>
      {job.status === "running" && <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden="true" />}
      {humanize(job.status)}
    </Badge>
  );
}

function StageProgress({ job }: { job: IngestionJob }) {
  const stages: string[] = STAGES.includes(job.stage as (typeof STAGES)[number])
    ? [...STAGES]
    : [...STAGES, job.stage];
  const currentIndex = stages.indexOf(job.stage);

  return (
    <ol className="space-y-2">
      {stages.map((stage, index) => {
        const isDone = job.status === "done" || (currentIndex > -1 && index < currentIndex);
        const isCurrent = index === currentIndex && job.status !== "done";
        const isFailed = isCurrent && job.status === "failed";

        return (
          <li key={stage} className="flex items-center gap-3">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                isFailed
                  ? "border-[var(--destructive-border)] bg-[var(--destructive-subtle)] text-[var(--destructive)]"
                  : isDone
                    ? "border-success/40 bg-success/10 text-success"
                    : isCurrent
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              {isFailed ? (
                <AlertTriangle className="h-3 w-3" />
              ) : isDone ? (
                <Check className="h-3 w-3" />
              ) : isCurrent ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={`text-xs ${
                isCurrent || isDone ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {humanize(stage)}
            </span>
            {isCurrent && job.progress !== undefined && (
              <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
                {formatPercent(job.progress)}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-mono text-[11px] text-foreground">{value}</dd>
    </div>
  );
}
