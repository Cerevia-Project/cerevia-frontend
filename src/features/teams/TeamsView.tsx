"use client";

import * as React from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState, QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { useTeams } from "@/features/teams/api";

export function TeamsView() {
  const query = useTeams();
  const [filter, setFilter] = React.useState("");

  const items = (query.data?.items ?? []).filter((team) =>
    team.label.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Teams</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Teams recorded in the knowledge graph, with their members and what they own.
        </p>
      </header>

      <Input
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filter teams…"
        className="h-8 max-w-xs text-xs"
        aria-label="Filter teams by name"
      />

      <QueryBoundary
        query={query}
        errorTitle="Could not load teams"
        isEmpty={(page) => page.items.length === 0}
        empty={
          <EmptyState
            icon={<Users className="h-4 w-4" />}
            title="No teams"
            description="Teams appear here once they are extracted from ingested documents."
          />
        }
      >
        {() =>
          items.length === 0 ? (
            <EmptyState title="No team matches that filter" />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((team) => (
                <li key={team.id}>
                  <Link href={`/teams/${encodeURIComponent(team.id)}`}>
                    <Card className="p-3 transition-colors hover:border-primary/40">
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <EntityBadge type={team.type} iconOnly size="sm" />
                          <span className="truncate text-xs font-medium text-foreground">
                            {team.label}
                          </span>
                        </span>
                        {team.isSampleData && <SampleDataBadge />}
                      </span>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )
        }
      </QueryBoundary>
    </div>
  );
}
