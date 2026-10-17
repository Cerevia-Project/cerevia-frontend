"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, User, Network } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PEOPLE } from "./PeopleView";
import { MOCK_DECISIONS } from "@/mocks/decisions";

export function PersonDetailView({ personId }: { personId: string }) {
  const person = MOCK_PEOPLE.find((p) => p.id === personId) || MOCK_PEOPLE[0];
  const authoredDecisions = MOCK_DECISIONS.filter((d) => d.owner.toLowerCase().includes(person.name.toLowerCase().split(" ")[0]));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/people">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to People
          </Link>
        </Button>
      </div>

      {/* Person Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary text-primary border border-border">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {person.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {person.role} • {person.team}
            </p>
          </div>
        </div>

        <Button asChild size="sm" className="h-8 text-xs">
          <Link href="/graph">
            <Network className="mr-1.5 h-3.5 w-3.5" />
            View in Knowledge Graph
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">Company Tenure</span>
          <p className="font-semibold text-foreground">{person.tenure}</p>
        </Card>
        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">Authored ADRs</span>
          <p className="font-mono font-semibold text-foreground">{person.authoredDecisionsCount}</p>
        </Card>
        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">Active Projects</span>
          <p className="font-mono font-semibold text-foreground">{person.projectsCount}</p>
        </Card>
      </div>

      {/* Authored Decisions */}
      <Card>
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-sm font-semibold">
            Authored Decisions &amp; Architectural Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 divide-y divide-border">
          {(authoredDecisions.length > 0 ? authoredDecisions : MOCK_DECISIONS.slice(0, 2)).map((dec) => (
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
                <p className="text-[11px] text-muted-foreground mt-0.5">
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
