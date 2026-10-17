"use client";

import * as React from "react";
import { Upload, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function SourcesPage() {
  const sources = [
    {
      name: "Engineering Confluence Space",
      type: "Confluence Cloud",
      docs: 842,
      lastSync: "12m ago",
      status: "Synced",
      nodesExtracted: 6240,
    },
    {
      name: "Product Specs & PRDs",
      type: "Google Workspace",
      docs: 215,
      lastSync: "1h ago",
      status: "Synced",
      nodesExtracted: 3120,
    },
    {
      name: "Architecture & RFC Repositories",
      type: "GitHub Enterprise",
      docs: 148,
      lastSync: "3h ago",
      status: "Synced",
      nodesExtracted: 4180,
    },
    {
      name: "#eng-architecture Discussions",
      type: "Slack Workspace",
      docs: 40,
      lastSync: "Just now",
      status: "Indexing",
      nodesExtracted: 1280,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Knowledge Sources &amp; Ingestion
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Connect enterprise repositories to extract graph entities, decisions, and evidence into FalkorDB.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Synchronizing all knowledge connectors...")}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Sync All
          </Button>
          <Button size="sm" leftIcon={<Upload className="h-3.5 w-3.5" />}>
            Connect Source
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Connector Name</TableHead>
                <TableHead>Source Provider</TableHead>
                <TableHead>Ingested Docs</TableHead>
                <TableHead>FalkorDB Nodes Extracted</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-foreground">
                    {s.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.type}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.docs}</TableCell>
                  <TableCell className="font-mono text-xs">{s.nodesExtracted}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.lastSync}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "Synced" ? "success" : "warning"} size="sm">
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Configure
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
