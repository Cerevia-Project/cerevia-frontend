"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BotMessageSquare,
  Database,
  FileText,
  FolderKanban,
  Network,
  Scale,
  Users,
  UploadCloud,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { EmptyState, QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { useOverview } from "@/features/overview/api";
import { entityHref } from "@/lib/entity-routes";
import { formatNumber } from "@/lib/formatters";
import type { EntityRef, Overview } from "@/api/types";

/** Every metric links to the list it counts. */
const METRICS: {
  key: keyof Pick<Overview, "sources" | "documents" | "people" | "teams" | "projects">;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "sources", label: "Connected sources", href: "/sources", icon: Database },
  { key: "documents", label: "Indexed documents", href: "/sources", icon: FileText },
  { key: "people", label: "People", href: "/people", icon: Users },
  { key: "teams", label: "Teams", href: "/teams", icon: Users },
  { key: "projects", label: "Projects", href: "/projects", icon: FolderKanban },
];

export function OverviewView() {
  const query = useOverview();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            What this organization has connected, and what changed recently.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href="/assistant">
              <BotMessageSquare className="mr-1.5 h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Ask the assistant
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs">
            <Link href="/graph">
              <Network className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Explore the graph
            </Link>
          </Button>
        </div>
      </header>

      <QueryBoundary
        query={query}
        errorTitle="Could not load the overview"
        skeleton={
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-md" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Skeleton className="h-64 rounded-md lg:col-span-2" />
              <Skeleton className="h-64 rounded-md" />
            </div>
          </div>
        }
      >
        {(overview) => <OverviewContent overview={overview} />}
      </QueryBoundary>
    </div>
  );
}

function OverviewContent({ overview }: { overview: Overview }) {
  const isEmptyOrganization =
    overview.sources === 0 && overview.documents === 0 && overview.people === 0;

  if (isEmptyOrganization) {
    return (
      <EmptyState
        icon={<UploadCloud className="h-4 w-4" />}
        title="Nothing has been ingested yet"
        description="Connect a source and upload your first documents. Entities, relationships and decisions appear here as they are extracted."
        action={{ label: "Go to knowledge sources", href: "/sources" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {overview.alerts.length > 0 && (
        <ul className="space-y-2">
          {overview.alerts.map((alert, index) => (
            <li
              key={index}
              className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{alert}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {METRICS.map(({ key, label, href, icon: Icon }) => (
          <Card key={key} className="p-3.5 transition-colors hover:border-primary/40">
            <Link href={href} className="block space-y-1">
              <span className="flex items-center justify-between text-muted-foreground">
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider">
                  {label}
                </span>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="block font-mono text-xl font-bold tracking-tight tabular-nums text-foreground">
                {formatNumber(overview[key])}
              </span>
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <EntityListCard
            title="Recent decisions"
            icon={Scale}
            items={overview.recentDecisions}
            emptyText="No decisions have been recorded yet."
            moreHref="/decisions"
          />
          <EntityListCard
            title="Outstanding blockers"
            icon={AlertTriangle}
            items={overview.openBlockers}
            emptyText="Nothing is currently flagged as blocked."
            moreHref="/projects"
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border p-4">
              <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
              <CardTitle className="text-sm font-semibold">Ingestion</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <dl className="grid grid-cols-3 gap-2 text-center">
                <IngestionStat label="Succeeded" value={overview.ingestion.succeeded} />
                <IngestionStat label="In progress" value={overview.ingestion.inProgress} />
                <IngestionStat label="Failed" value={overview.ingestion.failed} />
              </dl>
              <Button asChild variant="ghost" size="sm" className="mt-3 h-7 w-full text-xs">
                <Link href="/sources">
                  Open the ingestion monitor
                  <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <EntityListCard
            title="Recently updated knowledge"
            icon={Network}
            items={overview.recentlyUpdated}
            emptyText="No knowledge has changed recently."
          />
        </div>
      </div>
    </div>
  );
}

function IngestionStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/30 p-2">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-mono text-base font-semibold tabular-nums text-foreground">
        {formatNumber(value)}
      </dd>
    </div>
  );
}

function EntityListCard({
  title,
  icon: Icon,
  items,
  emptyText,
  moreHref,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: EntityRef[];
  emptyText: string;
  moreHref?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </span>
        {moreHref && (
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
            <Link href={moreHref}>View all</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3">
        {items.length === 0 ? (
          <p className="px-1 py-3 text-xs text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="py-2 first:pt-1 last:pb-1">
                <Link
                  href={entityHref(item.type, item.id)}
                  className="flex items-center justify-between gap-2 rounded px-1 py-1 transition-colors hover:bg-accent/50"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <EntityBadge type={item.type} iconOnly size="sm" />
                    <span className="truncate text-xs font-medium text-foreground">
                      {item.label}
                    </span>
                  </span>
                  {item.isSampleData && <SampleDataBadge />}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
