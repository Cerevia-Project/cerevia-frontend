"use client";

import * as React from "react";
import { Plus, Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { EntityBadge } from "@/components/entities/EntityBadge";

export default function DecisionsPage() {
  const [filter, setFilter] = React.useState("");

  const decisions = [
    {
      id: "ADR-104",
      title: "FalkorDB as Primary Knowledge Graph Database",
      owner: "Infra Arch",
      ownerType: "team" as const,
      evidence: "confirmed" as const,
      citation: "ADR-104",
      date: "Oct 12, 2026",
    },
    {
      id: "ADR-098",
      title: "Streaming Cytoscape Visualization Pipeline",
      owner: "Apollo Project",
      ownerType: "project" as const,
      evidence: "inferred" as const,
      citation: "RFC-88",
      date: "Oct 8, 2026",
    },
    {
      id: "ADR-092",
      title: "Cross-Team Vector Embedding Deduplication",
      owner: "Dr. Elena Vance",
      ownerType: "person" as const,
      evidence: "hypothesis" as const,
      citation: "PRD-2026",
      date: "Oct 3, 2026",
    },
    {
      id: "ADR-085",
      title: "Document Ingestion Policy for Private Slack Channels",
      owner: "Legal Compliance",
      ownerType: "team" as const,
      evidence: "conflicting" as const,
      citation: "SEC-14",
      date: "Sep 28, 2026",
    },
    {
      id: "ADR-079",
      title: "Automated Evidence Extraction from Zoom Recordings",
      owner: "Media AI",
      ownerType: "project" as const,
      evidence: "missing" as const,
      citation: "RFC-42",
      date: "Sep 15, 2026",
    },
  ];

  const filteredDecisions = decisions.filter(
    (d) =>
      d.title.toLowerCase().includes(filter.toLowerCase()) ||
      d.id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Decisions &amp; Evidence Tracing
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse verified Architectural Decision Records (ADRs) with multi-hop citations in the knowledge graph.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Record Decision
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Filter decisions by ID or keyword..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            leftIcon={<Search className="h-3.5 w-3.5" />}
          />
        </div>
        <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
          Filter State
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead>Decision Title</TableHead>
                <TableHead>Owner Entity</TableHead>
                <TableHead>Evidence Verification</TableHead>
                <TableHead>Source Citation</TableHead>
                <TableHead>Recorded</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDecisions.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono font-medium">{d.id}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {d.title}
                  </TableCell>
                  <TableCell>
                    <EntityBadge type={d.ownerType} name={d.owner} size="sm" />
                  </TableCell>
                  <TableCell>
                    <EvidenceBadge state={d.evidence} size="sm" />
                  </TableCell>
                  <TableCell>
                    <CitationChip
                      citation={{
                        id: `cit-${d.id}`,
                        code: d.citation,
                        label: `Supporting document for ${d.id}`,
                        documentTitle: `${d.title} - Official Record`,
                        sourceType: "confluence",
                      }}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {d.date}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
