"use client";

import * as React from "react";
import { Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AccessView() {
  const [tlsAuth, setTlsAuth] = React.useState(true);
  const [multiHopAudit, setMultiHopAudit] = React.useState(true);
  const [autoDeduplication, setAutoDeduplication] = React.useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Access &amp; Security Policies
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure FalkorDB multi-tenant graph parameters, TLS token enforcement, and audit retention.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              FalkorDB Graph Engine Security
            </h3>
          </div>

          <div className="space-y-4 divide-y divide-border/60">
            <div className="pt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tls-auth">Enforce TLS &amp; Token Auth on Graph Endpoints</Label>
                <p className="text-xs text-muted-foreground">
                  Requires all Cypher traversals to supply cryptographically signed JWT bearer headers.
                </p>
              </div>
              <Switch
                id="tls-auth"
                checked={tlsAuth}
                onCheckedChange={(val) => {
                  setTlsAuth(val);
                  toast.success("TLS policy updated.");
                }}
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hop-audit">Audit Multi-Hop Knowledge Traversals</Label>
                <p className="text-xs text-muted-foreground">
                  Records all AI assistant path deductions for compliance and evidence verification.
                </p>
              </div>
              <Switch
                id="hop-audit"
                checked={multiHopAudit}
                onCheckedChange={(val) => {
                  setMultiHopAudit(val);
                  toast.success("Audit logging updated.");
                }}
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dedup">Automatic Entity Deduplication (&gt;95% similarity)</Label>
                <p className="text-xs text-muted-foreground">
                  Merge entity nodes automatically when embedding vector cosine similarity exceeds 0.95.
                </p>
              </div>
              <Switch
                id="dedup"
                checked={autoDeduplication}
                onCheckedChange={(val) => {
                  setAutoDeduplication(val);
                  toast.success("Deduplication threshold updated.");
                }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
