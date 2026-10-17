"use client";

import * as React from "react";
import Link from "next/link";
import { User, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PersonItem {
  id: string;
  name: string;
  role: string;
  team: string;
  tenure: string;
  authoredDecisionsCount: number;
  projectsCount: number;
  status: "active" | "away";
}

export const MOCK_PEOPLE: PersonItem[] = [
  {
    id: "person-elena",
    name: "Elena Rostova",
    role: "Principal Data Architect",
    team: "Core Platform",
    tenure: "4 years",
    authoredDecisionsCount: 14,
    projectsCount: 3,
    status: "active",
  },
  {
    id: "person-marcus",
    name: "Marcus Chen",
    role: "Security & Compliance Lead",
    team: "Security & Compliance",
    tenure: "3 years",
    authoredDecisionsCount: 8,
    projectsCount: 2,
    status: "active",
  },
  {
    id: "person-devon",
    name: "Devon Vance",
    role: "Staff Site Reliability Engineer",
    team: "Infrastructure SRE",
    tenure: "5 years",
    authoredDecisionsCount: 11,
    projectsCount: 4,
    status: "active",
  },
  {
    id: "person-sarah",
    name: "Sarah Lin",
    role: "VP Engineering",
    team: "Engineering Leadership",
    tenure: "6 years",
    authoredDecisionsCount: 19,
    projectsCount: 6,
    status: "active",
  },
];

export function PeopleView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              People &amp; Knowledge Owners
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              {MOCK_PEOPLE.length} Key Contributors
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify domain experts, decision authors, and ownership networks mapped in the knowledge graph.
          </p>
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_PEOPLE.map((p) => (
          <Card key={p.id} className="p-4 flex flex-col justify-between hover:border-primary/40 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary border border-border">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <Link
                    href={`/people/${p.id}`}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors block"
                  >
                    {p.name}
                  </Link>
                  <p className="text-[11px] text-muted-foreground">{p.role}</p>
                </div>
              </div>

              <div className="rounded border border-border p-2.5 bg-background/50 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Team</span>
                  <span className="font-medium text-foreground">{p.team}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Decisions</span>
                  <span className="font-mono text-foreground">{p.authoredDecisionsCount} ADRs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Projects</span>
                  <span className="font-mono text-foreground">{p.projectsCount}</span>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Button asChild variant="outline" size="sm" className="w-full h-7 text-xs">
                <Link href={`/people/${p.id}`}>
                  View Profile <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
