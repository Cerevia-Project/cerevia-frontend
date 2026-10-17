"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { MOCK_DECISIONS } from "@/mocks/decisions";

export function DecisionsView() {
  const [search, setSearch] = React.useState("");

  const filteredDecisions = React.useMemo(() => {
    if (!search.trim()) return MOCK_DECISIONS;
    const q = search.toLowerCase();
    return MOCK_DECISIONS.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.team.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Architectural Decision Records (ADRs)
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              {MOCK_DECISIONS.length} Verified
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable log of engineering, product, and platform architecture decisions verified in FalkorDB.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions by title, code, or team..."
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>
      </div>

      {/* Decisions List */}
      <div className="space-y-3">
        {filteredDecisions.map((dec) => (
          <Card key={dec.id} className="p-4 hover:border-primary/40 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                    {dec.code}
                  </span>
                  <Link
                    href={`/decisions/${dec.id}`}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {dec.title}
                  </Link>
                  <EvidenceBadge state={dec.evidenceState} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {dec.summary}
                </p>

                {dec.citations && dec.citations.length > 0 && (
                  <div className="pt-1 flex items-center gap-1.5">
                    {dec.citations.map((c) => (
                      <CitationChip key={c.id} citation={c} size="sm" />
                    ))}
                  </div>
                )}
              </div>

              <div className="sm:text-right shrink-0 space-y-1 text-xs">
                <div className="flex sm:flex-col sm:items-end gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono capitalize">
                    {dec.status.replace("_", " ")}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">{dec.date}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <span>Owner: </span>
                  <span className="font-medium text-foreground">{dec.owner}</span>
                </div>
                <div className="pt-1">
                  <Button asChild variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground">
                    <Link href={`/decisions/${dec.id}`}>
                      Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
