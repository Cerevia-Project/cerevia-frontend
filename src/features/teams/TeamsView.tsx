"use client";

import * as React from "react";
import Link from "next/link";
import { Users, ArrowRight, Network, FolderGit2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TeamItem {
  id: string;
  name: string;
  lead: string;
  membersCount: number;
  description: string;
  activeProjects: string[];
  keyDecisionsCount: number;
}

export const MOCK_TEAMS: TeamItem[] = [
  {
    id: "team-platform",
    name: "Core Platform",
    lead: "Elena Rostova",
    membersCount: 8,
    description: "Responsible for graph storage, vector query routing, and data schemas.",
    activeProjects: ["Project Synapse"],
    keyDecisionsCount: 14,
  },
  {
    id: "team-infra",
    name: "Infrastructure SRE",
    lead: "Devon Vance",
    membersCount: 6,
    description: "Kubernetes clusters, Redis/FalkorDB replication, and multi-region observability.",
    activeProjects: ["Aurora Ingestion Gateway"],
    keyDecisionsCount: 9,
  },
  {
    id: "team-security",
    name: "Security & Compliance",
    lead: "Marcus Chen",
    membersCount: 5,
    description: "Presidio PII scrubbing, SOC-2 Type II audit policies, and RBAC enforcement.",
    activeProjects: ["Shield Compliance & Redaction"],
    keyDecisionsCount: 7,
  },
];

export function TeamsView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Teams &amp; Organizational Units
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              {MOCK_TEAMS.length} Active Teams
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Engineering, product, and platform squads connected in the enterprise knowledge graph.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_TEAMS.map((team) => (
          <Card key={team.id} className="p-4 flex flex-col justify-between hover:border-primary/40 transition-colors">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-primary border border-border">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <Link
                      href={`/teams/${team.id}`}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors block"
                    >
                      {team.name}
                    </Link>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Lead: {team.lead}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {team.description}
              </p>

              <div className="rounded border border-border p-2.5 bg-background/50 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-mono text-foreground">{team.membersCount} engineers</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Governed ADRs</span>
                  <span className="font-mono text-foreground">{team.keyDecisionsCount}</span>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Button asChild variant="outline" size="sm" className="w-full h-7 text-xs">
                <Link href={`/teams/${team.id}`}>
                  View Team <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
