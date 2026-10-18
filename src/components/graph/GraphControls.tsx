"use client";

import * as React from "react";
import {
  Download,
  Filter,
  GitBranch,
  Maximize2,
  Network,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GraphLayout } from "@/components/graph/GraphCanvas";
import type { EdgeTypeMeta, EntityTypeMeta } from "@/api/types";
import { DEFAULT_GRAPH_DEPTH } from "@/lib/flags";

export interface GraphControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  layout: GraphLayout;
  onLayoutChange: (layout: GraphLayout) => void;
  depth: number;
  onDepthChange: (depth: number) => void;
  entityTypes: EntityTypeMeta[];
  selectedEntityTypes: string[];
  onEntityTypesChange: (types: string[]) => void;
  edgeTypes: EdgeTypeMeta[];
  selectedEdgeTypes: string[];
  onEdgeTypesChange: (types: string[]) => void;
  showHistorical: boolean;
  onShowHistoricalChange: (value: boolean) => void;
  nodeCount: number;
  edgeCount: number;
  truncated?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onExport: () => void;
  disabled?: boolean;
}

export function GraphControls({
  search,
  onSearchChange,
  layout,
  onLayoutChange,
  depth,
  onDepthChange,
  entityTypes,
  selectedEntityTypes,
  onEntityTypesChange,
  edgeTypes,
  selectedEdgeTypes,
  onEdgeTypesChange,
  showHistorical,
  onShowHistoricalChange,
  nodeCount,
  edgeCount,
  truncated,
  onZoomIn,
  onZoomOut,
  onFit,
  onExport,
  disabled,
}: GraphControlsProps) {
  const activeFilters = selectedEntityTypes.length + selectedEdgeTypes.length;

  const toggle = (list: string[], value: string, onChange: (next: string[]) => void) => {
    onChange(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2">
      <div className="relative min-w-[200px] flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search for an entity to focus on…"
          className="h-8 pl-8 text-xs"
          aria-label="Search entities to focus the graph"
        />
      </div>

      <Select value={layout} onValueChange={(value) => onLayoutChange(value as GraphLayout)}>
        <SelectTrigger className="h-8 w-[150px] text-xs" aria-label="Graph layout">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="force" className="text-xs">
            <Network className="mr-1.5 inline h-3 w-3" aria-hidden="true" />
            Force-directed
          </SelectItem>
          <SelectItem value="hierarchical" className="text-xs">
            <GitBranch className="mr-1.5 inline h-3 w-3" aria-hidden="true" />
            Hierarchical
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={String(depth)} onValueChange={(value) => onDepthChange(Number(value))}>
        <SelectTrigger className="h-8 w-[110px] text-xs" aria-label="Expansion depth">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3].map((value) => (
            <SelectItem key={value} value={String(value)} className="text-xs">
              Depth {value}
              {value === DEFAULT_GRAPH_DEPTH ? " (default)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" disabled={disabled}>
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Filters
            {activeFilters > 0 && (
              <Badge variant="secondary" size="sm" className="ml-0.5 text-[10px]">
                {activeFilters}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-3">
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Entity types
              </legend>
              <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {entityTypes.map((entityType) => (
                  <label
                    key={entityType.type}
                    className="flex cursor-pointer items-center gap-2 text-xs text-foreground"
                  >
                    <Checkbox
                      checked={selectedEntityTypes.includes(entityType.type)}
                      onCheckedChange={() =>
                        toggle(selectedEntityTypes, entityType.type, onEntityTypesChange)
                      }
                    />
                    {entityType.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Relationship types
              </legend>
              <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {edgeTypes.map((edgeType) => (
                  <label
                    key={edgeType.type}
                    className="flex cursor-pointer items-center gap-2 text-xs text-foreground"
                  >
                    <Checkbox
                      checked={selectedEdgeTypes.includes(edgeType.type)}
                      onCheckedChange={() =>
                        toggle(selectedEdgeTypes, edgeType.type, onEdgeTypesChange)
                      }
                    />
                    {edgeType.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <Label htmlFor="historical-edges" className="text-xs">
                Show historical relationships
              </Label>
              <Switch
                id="historical-edges"
                checked={showHistorical}
                onCheckedChange={onShowHistoricalChange}
              />
            </div>

            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-full text-xs"
                onClick={() => {
                  onEntityTypesChange([]);
                  onEdgeTypesChange([]);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {nodeCount} nodes · {edgeCount} edges
          {truncated ? " · truncated" : ""}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={onZoomOut} aria-label="Zoom out" disabled={disabled}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onZoomIn} aria-label="Zoom in" disabled={disabled}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onFit} aria-label="Fit to view" disabled={disabled}>
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onExport} aria-label="Export as image" disabled={disabled}>
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
