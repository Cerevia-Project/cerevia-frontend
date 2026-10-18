"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryBoundary } from "@/components/feedback";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { usePerson } from "@/features/people/api";
import { entityHref, graphHref } from "@/lib/entity-routes";

/**
 * A person's profile.
 *
 * Only fields the API returned are rendered: an omitted field is left out
 * rather than shown as a blank, so the page never implies missing data.
 */
export function PersonDetailView({ personId }: { personId: string }) {
  const query = usePerson(personId);

  return (
    <div className="max-w-4xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
        <Link href="/people">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Back to people
        </Link>
      </Button>

      <QueryBoundary query={query} errorTitle="Could not load this profile" notFoundTitle="Profile not found">
        {(person) => (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{person.label}</h1>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link href={graphHref({ entity: person.id })}>
                  <Network className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Open in the graph
                </Link>
              </Button>
            </header>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="border-b border-border p-4">
                  <CardTitle className="text-sm font-semibold">Teams</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {person.memberships.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No team membership is recorded.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {person.memberships.map((team) => (
                        <Link key={team.id} href={entityHref(team.type, team.id)}>
                          <EntityBadge type={team.type} label={team.label} size="sm" clickable />
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border p-4">
                  <CardTitle className="text-sm font-semibold">Responsibilities</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {person.responsibilities.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No responsibility is recorded.
                    </p>
                  ) : (
                    <ul className="list-disc space-y-1 pl-4 text-xs text-foreground">
                      {person.responsibilities.map((responsibility, index) => (
                        <li key={index}>{responsibility}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="border-b border-border p-4">
                <CardTitle className="text-sm font-semibold">Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {person.expertise.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No evidenced expertise is recorded for this person.
                  </p>
                ) : (
                  person.expertise.map((entry) => (
                    <div
                      key={entry.topic}
                      className="space-y-1.5 rounded-md border border-border/60 bg-muted/30 p-3"
                    >
                      <p className="text-xs font-medium text-foreground">{entry.topic}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.evidence.map((citation, index) => (
                          <CitationChip
                            key={citation.id}
                            citation={citation}
                            index={index + 1}
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
