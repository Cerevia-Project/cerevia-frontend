"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Network } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { MOCK_PROJECTS } from "./ProjectsView";
import { MOCK_DECISIONS } from "@/mocks/decisions";

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const project = MOCK_PROJECTS.find((p) => p.id === projectId) || MOCK_PROJECTS[0];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/projects">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Projects
          </Link>
        </Button>
      </div>

      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
              {project.code}
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {project.name}
            </h1>
            <EvidenceBadge state={project.evidenceState} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {project.description}
          </p>
        </div>

        <Button asChild size="sm" className="h-8 text-xs">
          <Link href="/graph">
            <Network className="mr-1.5 h-3.5 w-3.5" />
            Trace in Graph
          </Link>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-xs space-y-1">
          <span className="text-muted-foreground">Owner</span>
          <p className="font-semibold text-foreground">{project.owner}</p>
        </Card>
        <Card className="p-3 text-xs space-y-1">
          <span className="text-muted-foreground">Owning Team</span>
          <p className="font-semibold text-foreground">{project.team}</p>
        </Card>
        <Card className="p-3 text-xs space-y-1">
          <span className="text-muted-foreground">Timeline Target</span>
          <p className="font-semibold text-foreground">{project.targetQuarter}</p>
        </Card>
        <Card className="p-3 text-xs space-y-1">
          <span className="text-muted-foreground">Progress</span>
          <p className="font-mono font-semibold text-foreground">{project.progress}%</p>
        </Card>
      </div>

      {/* Linked Decisions */}
      <Card>
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-sm font-semibold">
            Governing Architectural Decisions ({MOCK_DECISIONS.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 divide-y divide-border">
          {MOCK_DECISIONS.map((dec) => (
            <div key={dec.id} className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                    {dec.code}
                  </span>
                  <Link
                    href={`/decisions/${dec.id}`}
                    className="text-xs font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {dec.title}
                  </Link>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {dec.summary}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                {dec.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
