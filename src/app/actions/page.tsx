"use client";

import * as React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { toast } from "sonner";

export default function ActionsPage() {
  const [approvals, setApprovals] = React.useState([
    {
      id: "ACT-01",
      title: "Promote Cytoscape WebGL Renderer Hypothesis to Confirmed Fact",
      requester: "Habib Adavize",
      team: "UI Platform",
      evidence: "hypothesis" as const,
      urgency: "High",
    },
    {
      id: "ACT-02",
      title: "Approve FalkorDB Memory Allocation Increase to 8GB",
      requester: "Sarah Chen",
      team: "Infra Arch",
      evidence: "confirmed" as const,
      urgency: "Medium",
    },
    {
      id: "ACT-03",
      title: "Resolve Contradictory Claim in ADR-085 (Slack Ingestion)",
      requester: "Marcus Holloway",
      team: "InfoSec",
      evidence: "conflicting" as const,
      urgency: "Urgent",
    },
  ]);

  const handleAction = (id: string, actionType: "approve" | "reject") => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    toast.success(
      actionType === "approve"
        ? `Approved action ${id}. Record synchronized to FalkorDB.`
        : `Rejected action ${id}.`
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Actions &amp; Approvals
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review pending verification requests, evidence consensus decisions, and graph schema modifications.
        </p>
      </div>

      <div className="space-y-3">
        {approvals.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            All pending knowledge actions and evidence approvals have been resolved.
          </Card>
        ) : (
          approvals.map((item) => (
            <Card key={item.id} className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {item.id}
                    </span>
                    <Badge
                      variant={item.urgency === "Urgent" ? "destructive" : "warning"}
                      size="sm"
                    >
                      {item.urgency}
                    </Badge>
                    <EvidenceBadge state={item.evidence} size="sm" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Requested by {item.requester}</span>
                    <span>•</span>
                    <EntityBadge type="team" name={item.team} size="sm" />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(item.id, "reject")}
                    leftIcon={<XCircle className="h-3.5 w-3.5 text-destructive" />}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAction(item.id, "approve")}
                    leftIcon={<CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
