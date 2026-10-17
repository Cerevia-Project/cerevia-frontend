"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { toast } from "sonner";

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  proposer: string;
  team: string;
  evidence: "hypothesis" | "confirmed" | "conflicting" | "inferred";
  risk: "low" | "medium" | "high";
  date: string;
}

export const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: "ACT-01",
    title: "Promote Cytoscape WebGL Renderer Hypothesis to Confirmed Fact",
    description: "Multi-tenant benchmark logs verified that WebGL reduces render latency by 64% on 10k nodes.",
    proposer: "Habib Adavize",
    team: "UI Platform",
    evidence: "hypothesis",
    risk: "low",
    date: "2026-10-14",
  },
  {
    id: "ACT-02",
    title: "Approve FalkorDB Memory Allocation Increase to 64GB",
    description: "Mitigates eviction spikes discovered in PR-412 under batch Jira re-indexing.",
    proposer: "Devon Vance",
    team: "Infrastructure SRE",
    evidence: "confirmed",
    risk: "medium",
    date: "2026-10-15",
  },
  {
    id: "ACT-03",
    title: "Resolve Contradictory Claim in ADR-085 (Slack Ingestion PII)",
    description: "Align Slack retention rules with the newly ratified SOC-2 Type II Presidio policy.",
    proposer: "Marcus Chen",
    team: "Security & Compliance",
    evidence: "conflicting",
    risk: "high",
    date: "2026-10-16",
  },
];

export function ActionsView() {
  const [actions, setActions] = React.useState<ActionItem[]>(INITIAL_ACTIONS);

  const handleResolve = (id: string, decision: "approve" | "reject") => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    toast.success(
      decision === "approve"
        ? `Action ${id} approved and committed to FalkorDB.`
        : `Action ${id} rejected.`
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Actions &amp; Approvals
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              {actions.length} Pending
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review knowledge claims, schema promotions, and evidence consensus proposals awaiting sign-off.
          </p>
        </div>
      </div>

      {/* Action items list */}
      {actions.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground border-dashed">
          All pending actions and evidence approvals have been resolved.
        </Card>
      ) : (
        <div className="space-y-3">
          {actions.map((act) => (
            <Card key={act.id} className="p-4 space-y-3 hover:border-primary/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                      {act.id}
                    </span>
                    <Link
                      href={`/actions/${act.id}`}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {act.title}
                    </Link>
                    <EvidenceBadge state={act.evidence} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {act.description}
                  </p>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span>Proposed by <strong>{act.proposer}</strong> ({act.team})</span>
                    <span>•</span>
                    <span className="font-mono">{act.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleResolve(act.id, "reject")}
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-success hover:bg-success/90 text-white"
                    onClick={() => handleResolve(act.id, "approve")}
                  >
                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
