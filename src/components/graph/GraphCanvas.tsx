"use client";

import * as React from "react";
import { GraphData, GraphNode, EntityType } from "@/types";
import { cn } from "@/lib/utils";
import {
  User,
  Users,
  FolderGit2,
  FileCheck2,
  FileText,
} from "lucide-react";

export interface GraphCanvasProps {
  data: GraphData;
  selectedNodeId?: string | null;
  onSelectNode?: (node: GraphNode | null) => void;
  className?: string;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  filterType?: EntityType | "all";
}

const ENTITY_ICONS: Record<
  EntityType,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  person: User,
  team: Users,
  project: FolderGit2,
  decision: FileCheck2,
  document: FileText,
};

const ENTITY_COLORS: Record<EntityType, { bg: string; border: string; text: string; fill: string }> = {
  person: {
    bg: "rgba(58, 130, 117, 0.08)",
    border: "#3A8275",
    text: "#3A8275",
    fill: "#3A8275",
  },
  team: {
    bg: "rgba(107, 91, 149, 0.08)",
    border: "#6B5B95",
    text: "#6B5B95",
    fill: "#6B5B95",
  },
  project: {
    bg: "rgba(74, 114, 152, 0.08)",
    border: "#4A7298",
    text: "#4A7298",
    fill: "#4A7298",
  },
  decision: {
    bg: "rgba(148, 110, 36, 0.08)",
    border: "#946E24",
    text: "#946E24",
    fill: "#946E24",
  },
  document: {
    bg: "rgba(148, 78, 99, 0.08)",
    border: "#944E63",
    text: "#944E63",
    fill: "#944E63",
  },
};

export function GraphCanvas({
  data,
  selectedNodeId,
  onSelectNode,
  className,
  zoom = 1,
  filterType = "all",
}: GraphCanvasProps) {
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const filteredNodes = React.useMemo(() => {
    if (filterType === "all") return data.nodes;
    return data.nodes.filter((node) => node.type === filterType);
  }, [data.nodes, filterType]);

  const activeNodeIds = React.useMemo(() => {
    return new Set(filteredNodes.map((n) => n.id));
  }, [filteredNodes]);

  const filteredEdges = React.useMemo(() => {
    return data.edges.filter(
      (edge) => activeNodeIds.has(edge.source) && activeNodeIds.has(edge.target)
    );
  }, [data.edges, activeNodeIds]);

  const nodeMap = React.useMemo(() => {
    const map = new Map<string, GraphNode>();
    data.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [data.nodes]);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).id === "graph-background") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        "relative w-full h-[540px] overflow-hidden rounded-md border border-border bg-card select-none",
        className
      )}
    >
      {/* Background Grid - subtle technical blueprint style */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern
            id="graph-grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="0.75" className="fill-border/70" />
          </pattern>
          <marker
            id="edge-arrow"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-muted-foreground/60" />
          </marker>
          <marker
            id="edge-arrow-active"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#526B8A" />
          </marker>
        </defs>

        <rect
          id="graph-background"
          width="100%"
          height="100%"
          fill="url(#graph-grid)"
          onClick={() => onSelectNode?.(null)}
        />

        {/* Dynamic Zoom and Pan Group */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: "center", transition: isDragging ? "none" : "transform 0.15s ease-out" }}
        >
          {/* Render Edges */}
          {filteredEdges.map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;

            const x1 = sourceNode.x ?? 100;
            const y1 = sourceNode.y ?? 100;
            const x2 = targetNode.x ?? 300;
            const y2 = targetNode.y ?? 300;

            const isEdgeHighlighted =
              selectedNodeId === edge.source ||
              selectedNodeId === edge.target ||
              hoveredNodeId === edge.source ||
              hoveredNodeId === edge.target;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={edge.id} className="transition-all">
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={cn(
                    "transition-all duration-150",
                    isEdgeHighlighted
                      ? "stroke-primary stroke-[1.75px]"
                      : "stroke-border/80 stroke-[1px] dark:stroke-border"
                  )}
                  strokeDasharray={edge.state === "hypothesis" ? "3,3" : undefined}
                  markerEnd={isEdgeHighlighted ? "url(#edge-arrow-active)" : "url(#edge-arrow)"}
                />
                {edge.label && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-38"
                      y="-9"
                      width="76"
                      height="18"
                      rx="3"
                      className="fill-card/90 stroke-border/70 stroke-[0.75px]"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      className="text-[9px] font-mono fill-muted-foreground select-none"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {filteredNodes.map((node) => {
            const x = node.x ?? 200;
            const y = node.y ?? 200;
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const Icon = ENTITY_ICONS[node.type] || FileText;
            const style = ENTITY_COLORS[node.type] || ENTITY_COLORS.document;

            return (
              <g
                key={node.id}
                transform={`translate(${x}, ${y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode?.(node);
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer"
              >
                {/* Node Box */}
                <rect
                  x="-75"
                  y="-24"
                  width="150"
                  height="48"
                  rx="6"
                  className={cn(
                    "transition-all duration-150",
                    isSelected
                      ? "fill-card stroke-primary stroke-[2px] shadow-sm"
                      : isHovered
                      ? "fill-card stroke-border-subtle stroke-[1.5px] shadow-sm"
                      : "fill-card stroke-border stroke-[1px]"
                  )}
                />

                {/* Left Accent indicator stripe */}
                <rect
                  x="-75"
                  y="-24"
                  width="4"
                  height="48"
                  rx="2"
                  fill={style.border}
                />

                {/* Icon wrapper */}
                <rect
                  x="-62"
                  y="-12"
                  width="24"
                  height="24"
                  rx="4"
                  fill={style.bg}
                />
                <foreignObject x="-62" y="-12" width="24" height="24">
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon className="h-3.5 w-3.5" style={{ color: style.text }} />
                  </div>
                </foreignObject>

                {/* Node Label */}
                <text
                  x="-30"
                  y="-3"
                  className="text-[11px] font-semibold fill-foreground select-none"
                >
                  {node.label.length > 15 ? `${node.label.slice(0, 14)}…` : node.label}
                </text>

                {/* Node Subtitle / Type */}
                <text
                  x="-30"
                  y="12"
                  className="text-[9px] uppercase tracking-wider font-mono fill-muted-foreground select-none"
                >
                  {node.type}
                </text>

                {/* Evidence State Pill Indicator */}
                {node.evidenceState && (
                  <circle
                    cx="62"
                    cy="-14"
                    r="3.5"
                    className={cn(
                      node.evidenceState === "confirmed" && "fill-success",
                      node.evidenceState === "inferred" && "fill-primary",
                      node.evidenceState === "hypothesis" && "fill-purple-600",
                      node.evidenceState === "conflicting" && "fill-warning",
                      node.evidenceState === "missing" && "fill-muted-foreground"
                    )}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
