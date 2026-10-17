"use client";

import * as React from "react";
import Link from "next/link";
import {
  Network,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { EvidenceClaim, Citation } from "@/types";

const MOCK_CITATION_1: Citation = {
  id: "cit-1",
  code: "ADR-104",
  label: "FalkorDB benchmarked at 14x faster multi-hop traversal than relational SQL",
  documentTitle: "Architecture Decision Record: FalkorDB Graph Selection",
  sourceType: "confluence",
  snippet: "Benchmark results confirmed FalkorDB demonstrated 14x sub-millisecond multi-hop latency across 50k nodes.",
};

const MOCK_CITATION_2: Citation = {
  id: "cit-2",
  code: "PRD-2026.1",
  label: "Enterprise AI knowledge assistant response time targets",
  documentTitle: "Cerevia Product Requirements Document Q1",
  sourceType: "google_doc",
  snippet: "The conversational interface must provide source citations and verifiable graph evidence for every statement.",
};

const MOCK_CLAIM: EvidenceClaim = {
  id: "CLM-9042",
  claim: "FalkorDB was chosen for the knowledge store because graph traversal latency remained under 12ms for up to 6-hop queries across 50,000 entities.",
  state: "confirmed",
  confidenceScore: 98,
  rationale: "Validated against official engineering ADR-104 signed by the Lead Infrastructure Architect and corroborated by benchmark run logs.",
  citations: [MOCK_CITATION_1, MOCK_CITATION_2],
  graphPath: ["Decision #104", "justifiedBy", "Benchmark-Suite-4", "evaluatedBy", "Infra Architecture"],
};

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Company Knowledge Intelligence
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              FalkorDB v0.4.2
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Connected enterprise workspace: Acme Aerospace • 14,820 entities, 48,210 relationships synchronized.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            asChild
            variant="outline"
            size="sm"
            leftIcon={<Network className="h-3.5 w-3.5" />}
          >
            <Link href="/graph">Explore Graph</Link>
          </Button>

          <Button
            asChild
            size="sm"
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          >
            <Link href="/assistant">Ask Assistant</Link>
          </Button>
        </div>
      </div>

      {/* Intelligence KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[11px] font-medium uppercase tracking-wider">
              Connected Graph Entities
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono">14,820</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>+342 new nodes indexed this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[11px] font-medium uppercase tracking-wider">
              Verified Decisions
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono">312</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>94% with verifiable evidence chains</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[11px] font-medium uppercase tracking-wider">
              Ingested Sources
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono">1,245</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileSpreadsheet className="h-3 w-3 text-primary" />
              <span>Confluence, Docs, Slack, Jira, Git</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[11px] font-medium uppercase tracking-wider">
              Active Projects &amp; Risks
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono">28</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              <span>3 projects flag conflicting evidence</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Evidence Panel Showcase */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Latest Evidence-Backed AI Synthesized Claim
          </h2>
          <Link
            href="/decisions"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <span>View all claims</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <EvidencePanel claim={MOCK_CLAIM} />
      </div>

      {/* Recent Decisions Table */}
      <Card>
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Organizational Decisions</CardTitle>
            <CardDescription className="mt-1">
              Architectural decisions and trade-offs linked to multi-source evidence in FalkorDB.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/decisions">Full Decision Log</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead>Decision Title</TableHead>
                <TableHead>Entity Owner</TableHead>
                <TableHead>Evidence Verification</TableHead>
                <TableHead>Citations</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono font-medium">ADR-104</TableCell>
                <TableCell className="font-medium text-foreground">
                  FalkorDB as Primary Knowledge Graph Database
                </TableCell>
                <TableCell>
                  <EntityBadge type="team" name="Infra Arch" size="sm" />
                </TableCell>
                <TableCell>
                  <EvidenceBadge state="confirmed" size="sm" />
                </TableCell>
                <TableCell>
                  <CitationChip citation={MOCK_CITATION_1} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-mono font-medium">ADR-098</TableCell>
                <TableCell className="font-medium text-foreground">
                  Streaming Cytoscape Visualization Pipeline
                </TableCell>
                <TableCell>
                  <EntityBadge type="project" name="Apollo" size="sm" />
                </TableCell>
                <TableCell>
                  <EvidenceBadge state="inferred" size="sm" />
                </TableCell>
                <TableCell>
                  <CitationChip
                    citation={{
                      id: "cit-3",
                      code: "RFC-88",
                      label: "Cytoscape canvas rendering specs",
                      documentTitle: "Frontend Streaming Graph RFC",
                      sourceType: "github",
                    }}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-mono font-medium">ADR-092</TableCell>
                <TableCell className="font-medium text-foreground">
                  Cross-Team Vector Embedding Deduplication
                </TableCell>
                <TableCell>
                  <EntityBadge type="person" name="Dr. Vance" size="sm" />
                </TableCell>
                <TableCell>
                  <EvidenceBadge state="hypothesis" size="sm" />
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground italic">Pending benchmark</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-mono font-medium">ADR-085</TableCell>
                <TableCell className="font-medium text-foreground">
                  Document Ingestion Policy for Private Slack Channels
                </TableCell>
                <TableCell>
                  <EntityBadge type="decision" name="Legal Review" size="sm" />
                </TableCell>
                <TableCell>
                  <EvidenceBadge state="conflicting" size="sm" />
                </TableCell>
                <TableCell>
                  <CitationChip
                    citation={{
                      id: "cit-4",
                      code: "SEC-14",
                      label: "Data Retention & Privacy Guildline v3",
                      documentTitle: "Security Policy on Workspace Indexing",
                      sourceType: "confluence",
                    }}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Developer Callout Banner */}
      <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Cerevia Design System &amp; Component Foundation
          </span>
          <p className="text-xs text-muted-foreground">
            Explore and test all reusable UI components, evidence states, tokens, and theme variants on the dedicated showcase page.
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
          <Link href="/design-system">Open Design System Showcase</Link>
        </Button>
      </div>
    </div>
  );
}
