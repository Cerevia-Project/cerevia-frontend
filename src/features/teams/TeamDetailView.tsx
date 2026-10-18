"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryBoundary } from "@/components/feedback";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { useTeam } from "@/features/teams/api";
import { entityHref, graphHref } from "@/lib/entity-routes";
import type { EntityRef } from "@/api/types";

export function TeamDetailView({ teamId }: { teamId: string }) {
  const query = useTeam(teamId);

  return (
    <div className="max-w-4xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
        <Link href="/teams">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Back to teams
        </Link>
      </Button>

      <QueryBoundary query={query} errorTitle="Could not load this team" notFoundTitle="Team not found">
        {(team) => (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{team.label}</h1>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link href={graphHref({ entity: team.id })}>
                  <Network className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Open in the graph
                </Link>
              </Button>
            </header>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <EntityCard
                title={`Members (${team.members.length})`}
                items={team.members}
                emptyText="No member is recorded for this team."
              />
              <EntityCard
                title={`Owns (${team.owned.length})`}
                items={team.owned}
                emptyText="Nothing is recorded as owned by this team."
              />
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

function EntityCard({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: EntityRef[];
  emptyText: string;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border p-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
              <Link key={item.id} href={entityHref(item.type, item.id)}>
                <EntityBadge type={item.type} label={item.label} size="sm" clickable />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
