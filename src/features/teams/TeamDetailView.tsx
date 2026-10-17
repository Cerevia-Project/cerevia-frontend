"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Users, Network, FolderGit2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_TEAMS } from "./TeamsView";
import { MOCK_DECISIONS } from "@/mocks/decisions";

export function TeamDetailView({ teamId }: { teamId: string }) {
  const team = MOCK_TEAMS.find((t) => t.id === teamId) || MOCK_TEAMS[0];
  const teamDecisions = MOCK_DECISIONS.filter((d) => d.team.toLowerCase().includes(team.name.toLowerCase()));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/teams">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Teams
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary text-primary border border-border">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {team.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              Lead: {team.lead} • {team.membersCount} active members
            </p>
          </div>
        </div>

        <Button asChild size="sm" className="h-8 text-xs">
          <Link href="/graph">
            <Network className="mr-1.5 h-3.5 w-3.5" />
            Inspect Team in Graph
          </Link>
        </Button>
      </div>

      {/* Team Description */}
      <Card className="p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          Charter &amp; Responsibilities
        </h3>
        <p className="text-xs text-foreground leading-relaxed">
          {team.description}
        </p>
      </Card>

      {/* Team Governed ADRs */}
      <Card>
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-sm font-semibold">
            Governed Decisions &amp; RFCs ({teamDecisions.length || 2})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 divide-y divide-border">
          {(teamDecisions.length > 0 ? teamDecisions : MOCK_DECISIONS.slice(0, 2)).map((dec) => (
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
