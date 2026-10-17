"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Network, Calendar, User, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { MOCK_DECISIONS } from "@/mocks/decisions";

export function DecisionDetailView({ decisionId }: { decisionId: string }) {
  const decision = MOCK_DECISIONS.find((d) => d.id === decisionId) || MOCK_DECISIONS[0];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <div>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/decisions">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Decisions
          </Link>
        </Button>
      </div>

      {/* Decision Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
              {decision.code}
            </span>
            <EvidenceBadge state={decision.evidenceState} size="sm" />
            <Badge variant="outline" className="text-xs font-mono capitalize">
              {decision.status.replace("_", " ")}
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {decision.title}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {decision.summary}
          </p>
        </div>

        <Button asChild size="sm" className="h-8 text-xs shrink-0">
          <Link href="/graph">
            <Network className="mr-1.5 h-3.5 w-3.5" />
            Inspect in Graph
          </Link>
        </Button>
      </div>

      {/* Decision Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>Author</span>
          </div>
          <p className="font-semibold text-foreground">{decision.owner}</p>
        </Card>

        <Card className="p-3 text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>Owning Team</span>
          </div>
          <p className="font-semibold text-foreground">{decision.team}</p>
        </Card>

        <Card className="p-3 text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Ratified Date</span>
          </div>
          <p className="font-mono font-semibold text-foreground">{decision.date}</p>
        </Card>

        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">System Impact</span>
          <p className="font-semibold text-foreground">{decision.impactScore} Impact</p>
        </Card>
      </div>

      {/* Context & Drivers */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          Context &amp; Problem Statement
        </h3>
        <p className="text-xs leading-relaxed text-foreground">
          {decision.context}
        </p>

        <div className="pt-2 space-y-1.5">
          <h4 className="text-xs font-medium text-foreground">Decision Drivers:</h4>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
            {decision.drivers.map((driver, idx) => (
              <li key={idx}>{driver}</li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Considered Options */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          Evaluated Architectural Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {decision.optionsConsidered.map((opt, idx) => (
            <Card
              key={idx}
              className={`p-3.5 space-y-3 ${
                opt.chosen ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-semibold text-foreground">{opt.title}</h4>
                {opt.chosen && (
                  <Badge variant="default" className="text-[10px] bg-primary">
                    Chosen
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-success uppercase tracking-wider font-mono">
                    Pros
                  </span>
                  <ul className="mt-1 space-y-0.5">
                    {opt.pros.map((p, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-destructive uppercase tracking-wider font-mono">
                    Cons
                  </span>
                  <ul className="mt-1 space-y-0.5">
                    {opt.cons.map((c, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-destructive shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Consequences & Citations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Consequences &amp; Outcomes
          </h3>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
            {decision.consequences.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Supporting Evidence &amp; References
          </h3>
          {decision.citations && decision.citations.length > 0 ? (
            <div className="space-y-2 pt-1">
              {decision.citations.map((c) => (
                <div key={c.id} className="p-2 rounded border border-border bg-card space-y-1">
                  <CitationChip citation={c} />
                  {c.snippet && (
                    <p className="text-[11px] text-muted-foreground italic pl-1 border-l border-primary/30">
                      &quot;{c.snippet}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No external citations linked.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
