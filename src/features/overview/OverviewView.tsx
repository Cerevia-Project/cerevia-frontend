"use client";

import * as React from "react";
import Link from "next/link";
import {
  Network,
  BotMessageSquare,
  FileCheck2,
  Database,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { MOCK_EVIDENCE_CLAIMS } from "@/mocks/evidence";
import { MOCK_DECISIONS } from "@/mocks/decisions";
import { MOCK_INGESTION_JOBS } from "@/mocks/sources";

export function OverviewView() {
  const [selectedClaimId, setSelectedClaimId] = React.useState<string>(MOCK_EVIDENCE_CLAIMS[0].id);
  const activeClaim = MOCK_EVIDENCE_CLAIMS.find((c) => c.id === selectedClaimId) || MOCK_EVIDENCE_CLAIMS[0];

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Enterprise Knowledge Intelligence
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              FalkorDB v1.4
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unified organizational memory connecting documents, people, teams, projects, and decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href="/assistant">
              <BotMessageSquare className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Ask Assistant
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs">
            <Link href="/graph">
              <Network className="mr-1.5 h-3.5 w-3.5" />
              Explore Graph
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Knowledge Entities</span>
            <Layers className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono tracking-tight text-foreground">14,290</span>
            <span className="text-[11px] font-medium text-success flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +8.4%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Mapped across 18 teams</p>
        </Card>

        <Card className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Graph Relationships</span>
            <Network className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono tracking-tight text-foreground">58,410</span>
            <span className="text-[11px] font-medium text-success flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12.1%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Multi-hop connections</p>
        </Card>

        <Card className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Verification Rate</span>
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono tracking-tight text-foreground">98.2%</span>
            <span className="text-[11px] font-mono text-muted-foreground">p99 = 12ms</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Ground-truth corroborated</p>
        </Card>

        <Card className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Active Ingestion</span>
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono tracking-tight text-foreground">5 Sources</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Slack, Jira, Confluence, GitHub</p>
        </Card>
      </div>

      {/* Main Two-Column Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Claims & Verification (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Verified Knowledge Claims</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Extracted statements backed by FalkorDB graph evidence and source citations.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                <Link href="/decisions">
                  View Decisions <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px] hover:bg-transparent">
                    <TableHead className="w-[120px]">State</TableHead>
                    <TableHead>Claim Statement</TableHead>
                    <TableHead className="w-[80px] text-right">Confidence</TableHead>
                    <TableHead className="w-[140px]">Source Ref</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {MOCK_EVIDENCE_CLAIMS.map((claim) => (
                    <TableRow
                      key={claim.id}
                      onClick={() => setSelectedClaimId(claim.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedClaimId === claim.id ? "bg-secondary/70" : "hover:bg-secondary/40"
                      }`}
                    >
                      <TableCell>
                        <EvidenceBadge state={claim.state} size="sm" />
                      </TableCell>
                      <TableCell className="font-medium text-foreground max-w-xs truncate">
                        {claim.claim}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[11px]">
                        {claim.confidenceScore}%
                      </TableCell>
                      <TableCell>
                        {claim.citations[0] ? (
                          <CitationChip citation={claim.citations[0]} size="sm" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Active Claim Evidence Deep-Dive */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Evidence Deep Dive ({activeClaim.id})
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Click any table row above to inspect
              </span>
            </div>
            <EvidencePanel claim={activeClaim} />
          </div>
        </div>

        {/* Right Column: Architectural Decisions & Ingestion Status (1 col) */}
        <div className="space-y-6">
          {/* Recent Decisions */}
          <Card>
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Key Decisions</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                <Link href="/decisions">All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-3 divide-y divide-border">
              {MOCK_DECISIONS.map((dec) => (
                <div key={dec.id} className="py-2.5 first:pt-1 last:pb-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                      {dec.code}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{dec.date}</span>
                  </div>
                  <Link
                    href={`/decisions/${dec.id}`}
                    className="block text-xs font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {dec.title}
                  </Link>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{dec.team}</span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                      {dec.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Connected Data Sources */}
          <Card>
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Ingestion Sources</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                <Link href="/sources">Manage</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-3 divide-y divide-border">
              {MOCK_INGESTION_JOBS.slice(0, 4).map((job) => (
                <div key={job.id} className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between">
                  <div className="overflow-hidden pr-2">
                    <p className="text-xs font-medium text-foreground truncate">{job.sourceName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {job.documentCount.toLocaleString()} docs • {job.lastSync}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono capitalize shrink-0 ${
                      job.status === "synced"
                        ? "text-success border-success/30 bg-success/5"
                        : job.status === "syncing"
                        ? "text-primary border-primary/30 bg-primary/5"
                        : "text-muted-foreground"
                    }`}
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
