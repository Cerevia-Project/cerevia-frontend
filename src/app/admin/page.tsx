"use client";

import * as React from "react";
import { ShieldCheck, Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminPage() {
  const [falkorAuth, setFalkorAuth] = React.useState(true);
  const [multiHopAudit, setMultiHopAudit] = React.useState(true);
  const [autoDeduplication, setAutoDeduplication] = React.useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Administration &amp; Permissions
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure multi-tenant security policies, RBAC access controls, and FalkorDB knowledge engine parameters.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              FalkorDB Graph Engine Configuration
            </h3>
          </div>

          <div className="space-y-4 divide-y divide-border/60">
            <div className="pt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="falkor-auth">Enforce TLS &amp; Token Auth on Graph Endpoints</Label>
                <p className="text-xs text-muted-foreground">
                  Requires all Cypher and CytoStreaming queries to sign JWT bearer headers.
                </p>
              </div>
              <Switch
                id="falkor-auth"
                checked={falkorAuth}
                onCheckedChange={(val) => {
                  setFalkorAuth(val);
                  toast.success("Security setting updated.");
                }}
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="multi-hop-audit">Audit Multi-Hop Knowledge Traversals</Label>
                <p className="text-xs text-muted-foreground">
                  Logs all AI assistant path deductions for compliance and evidence verification.
                </p>
              </div>
              <Switch
                id="multi-hop-audit"
                checked={multiHopAudit}
                onCheckedChange={(val) => {
                  setMultiHopAudit(val);
                  toast.success("Audit logging updated.");
                }}
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-dedup">Automatic Entity Deduplication Threshold</Label>
                <p className="text-xs text-muted-foreground">
                  Merge entities with &gt;95% embedding similarity automatically without manual review.
                </p>
              </div>
              <Switch
                id="auto-dedup"
                checked={autoDeduplication}
                onCheckedChange={(val) => {
                  setAutoDeduplication(val);
                  toast.success("Deduplication policy updated.");
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Role-Based Access Control (RBAC)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Organization: <strong>Acme Aerospace</strong> • Active Role: <strong>Lead Knowledge Steward</strong>
          </p>
          <div className="pt-2 flex items-center gap-2">
            <Badge variant="outline">Admin</Badge>
            <Badge variant="outline">Knowledge Steward</Badge>
            <Badge variant="outline">Graph Explorer</Badge>
            <Badge variant="secondary">Auditor</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
