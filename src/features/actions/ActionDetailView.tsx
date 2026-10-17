"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { INITIAL_ACTIONS } from "./ActionsView";
import { toast } from "sonner";

export function ActionDetailView({ proposalId }: { proposalId: string }) {
  const action = INITIAL_ACTIONS.find((a) => a.id === proposalId) || INITIAL_ACTIONS[0];
  const [resolved, setResolved] = React.useState<"approved" | "rejected" | null>(null);

  const handleResolve = (decision: "approved" | "rejected") => {
    setResolved(decision);
    toast.success(`Action proposal ${decision}.`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/actions">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Actions
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
              {action.id}
            </span>
            <EvidenceBadge state={action.evidence} size="sm" />
            <Badge variant="outline" className="text-xs font-mono uppercase">
              Risk: {action.risk}
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {action.title}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {action.description}
          </p>
        </div>

        {resolved ? (
          <Badge
            variant="outline"
            className={`text-xs font-mono capitalize px-3 py-1 ${
              resolved === "approved"
                ? "text-success border-success/30 bg-success/5"
                : "text-destructive border-destructive/30 bg-destructive/5"
            }`}
          >
            {resolved}
          </Badge>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs text-destructive hover:bg-destructive/10"
              onClick={() => handleResolve("rejected")}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Reject
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-success hover:bg-success/90 text-white"
              onClick={() => handleResolve("approved")}
            >
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              Approve
            </Button>
          </div>
        )}
      </div>

      {/* Metadata Strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">Proposer</span>
          <p className="font-semibold text-foreground">{action.proposer}</p>
        </Card>
        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">Team</span>
          <p className="font-semibold text-foreground">{action.team}</p>
        </Card>
        <Card className="p-3 text-xs space-y-0.5">
          <span className="text-muted-foreground">Submission Date</span>
          <p className="font-mono font-semibold text-foreground">{action.date}</p>
        </Card>
      </div>

      {/* Impact Evaluation */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          FalkorDB Graph Mutation Impact
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Approval will update the backing knowledge graph node attributes and mark all downstream claims as verified ground truth. If rejected, the claim remains marked as {action.evidence}.
        </p>
      </Card>
    </div>
  );
}
