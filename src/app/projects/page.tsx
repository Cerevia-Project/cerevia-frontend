"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";

export default function ProjectsPage() {
  const projects = [
    {
      id: "PRJ-01",
      name: "Apollo Ingestion Pipeline",
      lead: "Dr. Elena Vance",
      status: "In Progress",
      riskState: "inferred" as const,
      riskNote: "Multi-source deduplication latency exceeds target.",
      decisionsCount: 14,
    },
    {
      id: "PRJ-02",
      name: "FalkorDB Graph Migration",
      lead: "Sarah Chen",
      status: "Verified Complete",
      riskState: "confirmed" as const,
      riskNote: "All 14,820 entity records migrated with full Cypher parity.",
      decisionsCount: 8,
    },
    {
      id: "PRJ-03",
      name: "Real-time Cytoscape Canvas",
      lead: "Habib Adavize",
      status: "Architecture Review",
      riskState: "hypothesis" as const,
      riskNote: "WebGL canvas performance on low-end laptops needs validation.",
      decisionsCount: 5,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Projects &amp; Risks
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track strategic initiatives and AI-flagged risk factors across organizational initiatives.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card key={p.id} hoverable>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {p.id}
                </span>
                <Badge variant="outline" size="sm">
                  {p.status}
                </Badge>
              </div>
              <CardTitle className="text-sm font-semibold">{p.name}</CardTitle>
              <CardDescription className="text-xs">
                Owner: {p.lead}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Graph Evidence Risk Assessment
                </span>
                <div className="pt-1">
                  <EvidenceBadge state={p.riskState} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {p.riskNote}
                </p>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.decisionsCount} Linked Decisions</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs p-1">
                  Inspect &rarr;
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
