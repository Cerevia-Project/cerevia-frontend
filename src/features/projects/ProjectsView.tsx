"use client";

import * as React from "react";
import Link from "next/link";
import { FolderGit2, ArrowRight, Layers, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { ProjectRecord } from "@/types";

export const MOCK_PROJECTS: ProjectRecord[] = [
  {
    id: "proj-synapse",
    code: "PRJ-01",
    name: "Project Synapse",
    description: "Enterprise Knowledge Graph and FalkorDB integration layer with multi-hop sub-15ms queries.",
    status: "active",
    owner: "Elena Rostova",
    team: "Core Platform",
    progress: 82,
    targetQuarter: "Q4 2026",
    relatedDecisionsCount: 4,
    documentsCount: 28,
    evidenceState: "confirmed",
  },
  {
    id: "proj-aurora",
    code: "PRJ-02",
    name: "Aurora Ingestion Gateway",
    description: "Real-time connector infrastructure syncing Confluence, Slack, GitHub and Jira with PII redaction.",
    status: "active",
    owner: "Devon Vance",
    team: "Infrastructure SRE",
    progress: 68,
    targetQuarter: "Q4 2026",
    relatedDecisionsCount: 2,
    documentsCount: 16,
    evidenceState: "confirmed",
  },
  {
    id: "proj-shield",
    code: "PRJ-03",
    name: "Shield Compliance & Redaction",
    description: "Presidio-based PII scrubbing pipeline enforcing zero-retention audit standards.",
    status: "completed",
    owner: "Marcus Chen",
    team: "Security & Compliance",
    progress: 100,
    targetQuarter: "Q3 2026",
    relatedDecisionsCount: 3,
    documentsCount: 12,
    evidenceState: "confirmed",
  },
];

export function ProjectsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Projects &amp; Initiatives
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              {MOCK_PROJECTS.length} Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Key organizational engineering and intelligence initiatives mapped in the knowledge graph.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_PROJECTS.map((proj) => (
          <Card key={proj.id} className="flex flex-col justify-between hover:border-primary/40 transition-colors">
            <CardHeader className="p-4 space-y-2 border-b border-border/60">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                  {proj.code}
                </span>
                <EvidenceBadge state={proj.evidenceState} size="sm" />
              </div>
              <CardTitle className="text-sm font-semibold">
                <Link href={`/projects/${proj.id}`} className="hover:text-primary transition-colors">
                  {proj.name}
                </Link>
              </CardTitle>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {proj.description}
              </p>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono font-medium text-foreground">{proj.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="text-[11px] text-muted-foreground space-y-1 pt-1 border-t border-border">
                <div className="flex items-center justify-between">
                  <span>Owner:</span>
                  <span className="font-medium text-foreground">{proj.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Team:</span>
                  <span className="text-foreground">{proj.team}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Decisions:</span>
                  <span className="font-mono text-foreground">{proj.relatedDecisionsCount} ADRs</span>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full h-7 text-xs">
                  <Link href={`/projects/${proj.id}`}>
                    View Project <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
