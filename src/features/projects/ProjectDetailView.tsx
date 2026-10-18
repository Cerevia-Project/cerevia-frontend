"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CircleAlert, FileText, Flag, Network, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { GraphListView } from "@/components/graph/GraphListView";
import {
  useLaunchReadiness,
  useProject,
  useProjectDependencies,
  useProjectRisks,
  useProjectTasks,
} from "@/features/projects/api";
import { entityHref, graphHref } from "@/lib/entity-routes";
import { humanize } from "@/lib/formatters";
import { errorMessage } from "@/api/errors";
import type { EntityRef, ReadinessVerdict, Risk, RiskLevel } from "@/api/types";

const RISK_STYLES: Record<RiskLevel, string> = {
  low: "text-success border-success/30 bg-success/5",
  medium: "text-amber-900 dark:text-amber-300 border-amber-500/40 bg-amber-500/10",
  high: "text-[var(--destructive)] border-[var(--destructive-border)] bg-[var(--destructive-subtle)]",
};

const VERDICT_STYLES: Record<ReadinessVerdict, string> = {
  ready: "text-success border-success/30 bg-success/5",
  at_risk: "text-amber-900 dark:text-amber-300 border-amber-500/40 bg-amber-500/10",
  not_ready:
    "text-[var(--destructive)] border-[var(--destructive-border)] bg-[var(--destructive-subtle)]",
};

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const project = useProject(projectId);
  const [activeTab, setActiveTab] = React.useState("summary");

  const tasks = useProjectTasks(projectId);
  const risks = useProjectRisks(projectId);
  const dependencies = useProjectDependencies(projectId, activeTab === "dependencies");
  const readiness = useLaunchReadiness(projectId, activeTab === "readiness");

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
        <Link href="/projects">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Back to projects
        </Link>
      </Button>

      <QueryBoundary
        query={project}
        errorTitle="Could not load this project"
        notFoundTitle="Project not found"
      >
        {(detail) => (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    {detail.label}
                  </h1>
                  {detail.isSampleData && <SampleDataBadge />}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {humanize(detail.status)}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${RISK_STYLES[detail.riskLevel]}`}>
                    {humanize(detail.riskLevel)} risk
                  </Badge>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link href={graphHref({ entity: detail.id })}>
                  <Network className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Open in the graph
                </Link>
              </Button>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="readiness">Launch readiness</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <EntityCard
                  title="Owners"
                  icon={Users}
                  items={detail.owners}
                  emptyText="No owner is recorded for this project."
                  gapText="Ownership gap: nobody is recorded as responsible."
                />
                <EntityCard
                  title="Milestones"
                  icon={Flag}
                  items={detail.milestones}
                  emptyText="No milestones are recorded."
                />
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <QueryBoundary
                  query={tasks}
                  errorTitle="Could not load tasks"
                  isEmpty={(page) => page.items.length === 0}
                  empty={<EmptyState title="No tasks" description="No tasks are linked to this project." />}
                >
                  {(page) => (
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="text-[11px] hover:bg-transparent">
                              <TableHead>Task</TableHead>
                              <TableHead className="w-[140px]">Type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="text-xs">
                            {page.items.map((task) => (
                              <TableRow key={task.id}>
                                <TableCell className="font-medium text-foreground">
                                  <Link href={entityHref(task.type, task.id)} className="hover:text-primary">
                                    {task.label}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <EntityBadge type={task.type} size="sm" />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </QueryBoundary>
              </TabsContent>

              <TabsContent value="dependencies" className="mt-4 space-y-4">
                <QueryBoundary
                  query={dependencies}
                  errorTitle="Could not load dependencies"
                  isEmpty={(subgraph) => subgraph.nodes.length === 0}
                  empty={
                    <EmptyState
                      title="No dependencies"
                      description="Nothing is recorded as depending on or blocking this project."
                    />
                  }
                >
                  {(subgraph) => (
                    <>
                      <GraphCanvas subgraph={subgraph} layout="hierarchical" className="h-[420px]" />
                      <GraphListView
                        subgraph={subgraph}
                        onSelectNode={() => undefined}
                        onSelectEdge={() => undefined}
                      />
                    </>
                  )}
                </QueryBoundary>
              </TabsContent>

              <TabsContent value="risks" className="mt-4">
                <QueryBoundary
                  query={risks}
                  errorTitle="Could not load risks"
                  isEmpty={(data) => data.items.length === 0}
                  empty={
                    <EmptyState
                      title="No risks recorded"
                      description="No risk has been derived for this project."
                    />
                  }
                >
                  {(data) => (
                    <div className="space-y-3">
                      {data.items.map((risk) => (
                        <RiskCard key={risk.id} risk={risk} />
                      ))}
                    </div>
                  )}
                </QueryBoundary>
              </TabsContent>

              <TabsContent value="readiness" className="mt-4">
                {readiness.isPending ? (
                  <Skeleton className="h-40 w-full rounded-md" />
                ) : readiness.isError ? (
                  <EmptyState
                    title="Readiness is not available"
                    description={errorMessage(readiness.error)}
                  />
                ) : readiness.data ? (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4">
                      <CardTitle className="text-sm font-semibold">Launch readiness</CardTitle>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${VERDICT_STYLES[readiness.data.verdict]}`}
                      >
                        {humanize(readiness.data.verdict)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4">
                      <p className="text-sm leading-relaxed text-foreground">
                        {readiness.data.summary}
                      </p>
                      <ul className="space-y-2">
                        {readiness.data.claims.map((claim) => (
                          <li
                            key={claim.id}
                            className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-2.5"
                          >
                            <EvidenceBadge kind={claim.kind} size="sm" />
                            <span className="text-xs leading-relaxed text-foreground">
                              {claim.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {readiness.data.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {readiness.data.citations.map((citation, index) => (
                            <CitationChip key={citation.id} citation={citation} index={index + 1} size="sm" />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : null}
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <EntityCard
                  title="Documents"
                  icon={FileText}
                  items={detail.documents}
                  emptyText="No documents are linked to this project."
                  gapText="Documentation gap: no document is linked to this project."
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

function RiskCard({ risk }: { risk: Risk }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 border-b border-border p-4">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold">{risk.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            <EvidenceBadge kind={risk.kind} size="sm" />
            <Badge variant="outline" className={`text-[10px] ${RISK_STYLES[risk.severity]}`}>
              {humanize(risk.severity)} severity
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <p className="text-xs leading-relaxed text-foreground">{risk.rationale}</p>

        {risk.claims.length > 0 && (
          <ul className="space-y-1.5">
            {risk.claims.map((claim) => (
              <li key={claim.id} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <EvidenceBadge kind={claim.kind} size="sm" showTooltip={false} />
                <span className="leading-relaxed">{claim.text}</span>
              </li>
            ))}
          </ul>
        )}

        {risk.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {risk.citations.map((citation, index) => (
              <CitationChip key={citation.id} citation={citation} index={index + 1} size="sm" />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EntityCard({
  title,
  icon: Icon,
  items,
  emptyText,
  gapText,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: EntityRef[];
  emptyText: string;
  gapText?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border p-4">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {items.length === 0 ? (
          gapText ? (
            <p className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-900 dark:text-amber-200">
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {gapText}
            </p>
          ) : (
            <p className="px-1 py-2 text-xs text-muted-foreground">{emptyText}</p>
          )
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
                    <span className="truncate text-xs font-medium text-foreground">{item.label}</span>
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
