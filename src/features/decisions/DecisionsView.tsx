"use client";

import * as React from "react";
import Link from "next/link";
import { Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { ConflictsView } from "@/features/decisions/ConflictsView";
import { useDecisions } from "@/features/decisions/api";
import { formatDate, humanize } from "@/lib/formatters";

export function DecisionsView() {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useDecisions(debounced.trim() ? { q: debounced.trim() } : {});

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Decisions and knowledge
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Recorded decisions, the evidence behind them, and places where sources disagree.
        </p>
      </header>

      <Tabs defaultValue="decisions">
        <TabsList>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        </TabsList>

        <TabsContent value="decisions" className="mt-4 space-y-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search decisions…"
            className="h-8 max-w-xs text-xs"
            aria-label="Search decisions"
          />

          <QueryBoundary
            query={query}
            errorTitle="Could not load decisions"
            isEmpty={(page) => page.items.length === 0}
            empty={
              <EmptyState
                icon={<Scale className="h-4 w-4" />}
                title="No decisions"
                description="Decisions appear here once they are extracted from ingested documents."
              />
            }
          >
            {(page) => (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px] hover:bg-transparent">
                        <TableHead>Decision</TableHead>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead className="w-[190px]">Owner</TableHead>
                        <TableHead className="w-[130px]">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {page.items.map((decision) => (
                        <TableRow key={decision.id}>
                          <TableCell className="font-medium text-foreground">
                            <Link
                              href={`/decisions/${encodeURIComponent(decision.id)}`}
                              className="flex items-center gap-2 hover:text-primary"
                            >
                              {decision.title}
                              {decision.isSampleData && <SampleDataBadge />}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {humanize(decision.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {decision.owner ? (
                              <span className="flex items-center gap-1.5">
                                <EntityBadge type={decision.owner.type} iconOnly size="sm" />
                                <span className="truncate text-muted-foreground">
                                  {decision.owner.label}
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">No owner recorded</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">
                            {formatDate(decision.date)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </QueryBoundary>
        </TabsContent>

        <TabsContent value="conflicts" className="mt-4">
          <ConflictsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
