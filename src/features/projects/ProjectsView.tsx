"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { EmptyState, QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { useProjects } from "@/features/projects/api";
import { humanize } from "@/lib/formatters";
import type { RiskLevel } from "@/api/types";

const RISK_STYLES: Record<RiskLevel, string> = {
  low: "text-success border-success/30 bg-success/5",
  medium: "text-amber-900 dark:text-amber-300 border-amber-500/40 bg-amber-500/10",
  high: "text-[var(--destructive)] border-[var(--destructive-border)] bg-[var(--destructive-subtle)]",
};

export function ProjectsView() {
  const query = useProjects();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [riskFilter, setRiskFilter] = React.useState("all");

  const items = React.useMemo(() => query.data?.items ?? [], [query.data]);

  const statuses = React.useMemo(
    () => [...new Set(items.map((project) => project.status))].sort(),
    [items],
  );

  const filtered = items.filter((project) => {
    const matchesSearch = project.label.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesRisk = riskFilter === "all" || project.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Projects and risks</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Status and risk level as the knowledge graph records them. Risk wording comes from the
          API, not from this screen.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter projects…"
          className="h-8 max-w-xs text-xs"
          aria-label="Filter projects by name"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[150px] text-xs" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All statuses
            </SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status} className="text-xs">
                {humanize(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="h-8 w-[150px] text-xs" aria-label="Filter by risk level">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All risk levels
            </SelectItem>
            {(["low", "medium", "high"] as RiskLevel[]).map((level) => (
              <SelectItem key={level} value={level} className="text-xs">
                {humanize(level)} risk
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <QueryBoundary
        query={query}
        errorTitle="Could not load projects"
        isEmpty={(page) => page.items.length === 0}
        empty={
          <EmptyState
            icon={<FolderKanban className="h-4 w-4" />}
            title="No projects"
            description="Projects appear here once they are extracted from ingested documents."
          />
        }
      >
        {() =>
          filtered.length === 0 ? (
            <EmptyState
              title="Nothing matches these filters"
              description="Try clearing the status or risk filter."
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px] hover:bg-transparent">
                      <TableHead>Project</TableHead>
                      <TableHead className="w-[160px]">Status</TableHead>
                      <TableHead className="w-[140px]">Risk level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {filtered.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium text-foreground">
                          <Link
                            href={`/projects/${encodeURIComponent(project.id)}`}
                            className="flex items-center gap-2 hover:text-primary"
                          >
                            {project.label}
                            {project.isSampleData && <SampleDataBadge />}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {humanize(project.status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${RISK_STYLES[project.riskLevel]}`}>
                            {humanize(project.riskLevel)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )
        }
      </QueryBoundary>
    </div>
  );
}
