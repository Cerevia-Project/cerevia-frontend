"use client";

import * as React from "react";
import Link from "next/link";
import { Network, Filter, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EntityBadge } from "@/components/entities/EntityBadge";

export default function GraphExplorerPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Knowledge Graph Explorer
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              FalkorDB Powered
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Interactive relational graph linking documents, decisions, teams, people, and projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
            Filter Node Types
          </Button>
          <Button size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Re-layout
          </Button>
        </div>
      </div>

      {/* Simulated Graph Canvas Viewport */}
      <Card className="h-[520px] relative overflow-hidden flex flex-col justify-between border-dashed bg-muted/20">
        {/* Controls Overlay */}
        <div className="p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <EntityBadge type="person" name="1.2k Persons" size="sm" />
            <EntityBadge type="team" name="84 Teams" size="sm" />
            <EntityBadge type="project" name="28 Projects" size="sm" />
            <EntityBadge type="decision" name="312 Decisions" size="sm" />
            <EntityBadge type="document" name="1.2k Docs" size="sm" />
          </div>

          <div className="flex items-center gap-1 bg-card border rounded-md p-1 shadow-xs">
            <Button variant="ghost" size="icon-sm" aria-label="Zoom in">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Zoom out">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Center Simulated Graph Representation */}
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-8 ring-primary/5 animate-pulse">
            <Network className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Cytoscape.js Canvas Viewport Placeholder
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
              In the upcoming iteration, Cytoscape.js will render real-time streaming Cypher graph nodes connecting FalkorDB multi-hop relationships.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/design-system">Test Component Library</Link>
            </Button>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="p-3 border-t bg-card/60 backdrop-blur-xs flex items-center justify-between text-xs text-muted-foreground">
          <span>Active Subgraph: Core Architecture Triples (500 nodes)</span>
          <span className="font-mono text-[10px]">Renderer: WebGL Fallback Active</span>
        </div>
      </Card>
    </div>
  );
}
