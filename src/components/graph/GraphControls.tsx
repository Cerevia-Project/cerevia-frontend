"use client";

import * as React from "react";
import { EntityType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Search,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface GraphControlsProps {
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onResetZoom: () => void;
  filterType: EntityType | "all";
  onFilterChange: (type: EntityType | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  nodeCount: number;
  edgeCount: number;
}

export function GraphControls({
  zoom,
  onZoomChange,
  onResetZoom,
  filterType,
  onFilterChange,
  searchQuery,
  onSearchChange,
  nodeCount,
  edgeCount,
}: GraphControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card p-2 text-xs">
      {/* Search Filter */}
      <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search graph nodes..."
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>
      </div>

      {/* Middle: Counts & Category Filter */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-[11px] font-mono text-muted-foreground border border-border">
          <Layers className="h-3 w-3" />
          <span>{nodeCount} nodes</span>
          <span className="text-border">|</span>
          <span>{edgeCount} relations</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="capitalize">{filterType === "all" ? "All Entities" : filterType}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuRadioGroup
              value={filterType}
              onValueChange={(val) => onFilterChange(val as EntityType | "all")}
            >
              <DropdownMenuRadioItem value="all">All Entities</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="person">People</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="team">Teams</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="project">Projects</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="decision">Decisions</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="document">Documents</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Zoom controls */}
      <div className="flex items-center gap-1 border-l border-border pl-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onZoomChange(Math.max(0.4, Number((zoom - 0.15).toFixed(2))))}
          title="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="w-10 text-center font-mono text-[11px] text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onZoomChange(Math.min(2.5, Number((zoom + 0.15).toFixed(2))))}
          title="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground"
          onClick={onResetZoom}
          title="Reset zoom"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
