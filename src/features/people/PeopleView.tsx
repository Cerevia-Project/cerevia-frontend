"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { usePeople, useExpertiseSearch } from "@/features/people/api";
import { formatPercent } from "@/lib/formatters";
import { errorMessage } from "@/api/errors";

export function PeopleView() {
  const query = usePeople();
  const [filter, setFilter] = React.useState("");

  const items = (query.data?.items ?? []).filter((person) =>
    person.label.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">People and teams</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Directory and expertise, each backed by the documents it was derived from.
        </p>
      </header>

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="expertise">Find expertise</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-4 space-y-4">
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter people…"
            className="h-8 max-w-xs text-xs"
            aria-label="Filter people by name"
          />

          <QueryBoundary
            query={query}
            errorTitle="Could not load the directory"
            isEmpty={(page) => page.items.length === 0}
            empty={
              <EmptyState
                icon={<Users className="h-4 w-4" />}
                title="No people"
                description="People appear here once they are extracted from ingested documents."
              />
            }
          >
            {() =>
              items.length === 0 ? (
                <EmptyState title="Nobody matches that filter" />
              ) : (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((person) => (
                    <li key={person.id}>
                      <Link href={`/people/${encodeURIComponent(person.id)}`}>
                        <Card className="p-3 transition-colors hover:border-primary/40">
                          <span className="flex items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <EntityBadge type={person.type} iconOnly size="sm" />
                              <span className="truncate text-xs font-medium text-foreground">
                                {person.label}
                              </span>
                            </span>
                            {person.isSampleData && <SampleDataBadge />}
                          </span>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            }
          </QueryBoundary>
        </TabsContent>

        <TabsContent value="expertise" className="mt-4">
          <ExpertiseSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Ranked people for a topic. The ranking and the evidence both come from the
 * API; nothing about a person is inferred here.
 */
function ExpertiseSearch() {
  const [topic, setTopic] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(topic), 300);
    return () => clearTimeout(timer);
  }, [topic]);

  const query = useExpertiseSearch(debounced);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Who knows about… ingestion, billing, retention?"
          className="h-8 pl-8 text-xs"
          aria-label="Expertise topic"
        />
      </div>

      {debounced.trim().length <= 1 ? (
        <p className="text-xs text-muted-foreground">
          Enter a topic to see who has worked on it, and what that is based on.
        </p>
      ) : query.isPending ? (
        <Skeleton className="h-24 w-full rounded-md" />
      ) : query.isError ? (
        <p className="text-xs text-muted-foreground">{errorMessage(query.error)}</p>
      ) : query.data.items.length === 0 ? (
        <EmptyState
          title="No evidenced expertise"
          description={`Nothing in the knowledge base links anyone to "${debounced}".`}
        />
      ) : (
        <ol className="space-y-3">
          {query.data.items.map((match) => (
            <li key={match.person.id}>
              <Card>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/people/${encodeURIComponent(match.person.id)}`}>
                      <EntityBadge
                        type={match.person.type}
                        label={match.person.label}
                        size="sm"
                        clickable
                      />
                    </Link>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {formatPercent(match.score)} match
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {match.evidence.map((citation, index) => (
                      <CitationChip
                        key={citation.id}
                        citation={citation}
                        index={index + 1}
                        size="sm"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
