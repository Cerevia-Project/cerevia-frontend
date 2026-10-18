"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import type {
  Core,
  CytoscapeOptions,
  ElementDefinition,
  EventObject,
  LayoutOptions,
  NodeSingular,
  StylesheetStyle,
} from "cytoscape";
import { cn } from "@/lib/utils";
import type { GraphEdge, GraphNode, Subgraph } from "@/api/types";
import { graphChrome, graphColor } from "@/components/graph/palette";
import { Skeleton } from "@/components/ui/skeleton";

export type GraphLayout = "force" | "hierarchical";

/** Viewport controls, driven by the controls bar. */
export interface GraphCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
  /** PNG data URL of the current view, or null before the graph is ready. */
  exportPng: () => string | null;
  focusNode: (nodeId: string) => void;
}

export interface GraphCanvasProps {
  subgraph: Subgraph;
  /** `colorKey` per entity type, from `GET /graph/schema`. */
  colorKeys?: Record<string, string>;
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  /** Node and edge ids on a highlighted path; everything else is dimmed. */
  highlightedIds?: ReadonlySet<string>;
  layout?: GraphLayout;
  onSelectNode?: (node: GraphNode | null) => void;
  onSelectEdge?: (edge: GraphEdge | null) => void;
  /** Double-click: expand this node's neighbourhood. */
  onExpandNode?: (node: GraphNode) => void;
  className?: string;
}

/**
 * Cytoscape adapter.
 *
 * The library is loaded on demand and never referenced outside this file, so
 * replacing it touches only this component. The canvas is hidden from
 * assistive technology: the synchronized list view is its accessible twin.
 */
export const GraphCanvas = React.forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  function GraphCanvas(
    {
      subgraph,
      colorKeys,
      selectedNodeId,
      selectedEdgeId,
      highlightedIds,
      layout = "force",
      onSelectNode,
      onSelectEdge,
      onExpandNode,
      className,
    },
    ref,
  ) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const cyRef = React.useRef<Core | null>(null);
    const [isReady, setIsReady] = React.useState(false);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const nodeById = React.useMemo(
      () => new Map(subgraph.nodes.map((node) => [node.id, node])),
      [subgraph.nodes],
    );
    const edgeById = React.useMemo(
      () => new Map(subgraph.edges.map((edge) => [edge.id, edge])),
      [subgraph.edges],
    );

    // Read through refs so a new handler never tears the graph down.
    const lookups = React.useRef({ nodeById, edgeById });
    lookups.current = { nodeById, edgeById };
    const handlers = React.useRef({ onSelectNode, onSelectEdge, onExpandNode });
    handlers.current = { onSelectNode, onSelectEdge, onExpandNode };

    React.useImperativeHandle(
      ref,
      (): GraphCanvasHandle => ({
        zoomIn: () => cyRef.current?.zoom({ level: cyRef.current.zoom() * 1.25, renderedPosition: center(cyRef.current) }),
        zoomOut: () => cyRef.current?.zoom({ level: cyRef.current.zoom() / 1.25, renderedPosition: center(cyRef.current) }),
        fit: () => cyRef.current?.fit(undefined, 40),
        exportPng: () => cyRef.current?.png({ full: true, scale: 2, bg: isDark ? "#14161a" : "#ffffff" }) ?? null,
        focusNode: (nodeId: string) => {
          const cy = cyRef.current;
          if (!cy) return;
          const element = cy.getElementById(nodeId);
          if (element.nonempty()) cy.animate({ center: { eles: element }, duration: 180 });
        },
      }),
      [isDark],
    );

    /* Create the instance once. */
    React.useEffect(() => {
      let disposed = false;
      let instance: Core | null = null;

      const boot = async () => {
        const [{ default: cytoscape }, { default: fcose }, { default: dagre }] = await Promise.all([
          import("cytoscape"),
          import("cytoscape-fcose"),
          import("cytoscape-dagre"),
        ]);

        if (disposed || !containerRef.current) return;

        // Registering an extension twice throws, and React may remount us.
        const registry = cytoscape as unknown as { __cereviaLayoutsRegistered?: boolean };
        if (!registry.__cereviaLayoutsRegistered) {
          cytoscape.use(fcose);
          cytoscape.use(dagre);
          registry.__cereviaLayoutsRegistered = true;
        }

        const options: CytoscapeOptions = {
          container: containerRef.current,
          elements: [],
          // Wheel sensitivity is deliberately left at the default: overriding
          // it tunes zooming to one mouse and OS and misbehaves on every other.
          minZoom: 0.2,
          maxZoom: 2.5,
        };

        instance = cytoscape(options);
        cyRef.current = instance;

        instance.on("tap", "node", (event: EventObject) => {
          const node = lookups.current.nodeById.get(event.target.id());
          if (node) handlers.current.onSelectNode?.(node);
        });
        instance.on("tap", "edge", (event: EventObject) => {
          const edge = lookups.current.edgeById.get(event.target.id());
          if (edge) handlers.current.onSelectEdge?.(edge);
        });
        instance.on("tap", (event: EventObject) => {
          if (event.target === instance) {
            handlers.current.onSelectNode?.(null);
            handlers.current.onSelectEdge?.(null);
          }
        });
        instance.on("dbltap", "node", (event: EventObject) => {
          const node = lookups.current.nodeById.get(event.target.id());
          if (node) handlers.current.onExpandNode?.(node);
        });

        setIsReady(true);
      };

      void boot();

      return () => {
        disposed = true;
        instance?.destroy();
        cyRef.current = null;
        setIsReady(false);
      };
    }, []);

    /* Keep the canvas sized to its container. */
    React.useEffect(() => {
      const container = containerRef.current;
      if (!container || !isReady || typeof ResizeObserver === "undefined") return;

      const observer = new ResizeObserver(() => {
        cyRef.current?.resize();
      });
      observer.observe(container);
      return () => observer.disconnect();
    }, [isReady]);

    /* Elements and layout. */
    React.useEffect(() => {
      const cy = cyRef.current;
      if (!cy || !isReady) return;

      const elements: ElementDefinition[] = [
        ...subgraph.nodes.map<ElementDefinition>((node) => ({
          group: "nodes",
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            colorKey: colorKeys?.[node.type] ?? node.type,
          },
        })),
        ...subgraph.edges
          // Cytoscape drops an edge with a missing endpoint; filter deliberately.
          .filter((edge) => nodeById.has(edge.from) && nodeById.has(edge.to))
          .map<ElementDefinition>((edge) => ({
            group: "edges",
            data: {
              id: edge.id,
              source: edge.from,
              target: edge.to,
              label: edge.type,
              current: edge.current ? 1 : 0,
            },
          })),
      ];

      cy.batch(() => {
        cy.elements().remove();
        cy.add(elements);
      });

      if (elements.length === 0) return;

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Force layouts barely separate a handful of nodes, so their labels
      // collide; a small neighbourhood reads better laid out on a ring.
      const isSmall = subgraph.nodes.length <= 12;
      const layoutOptions = (
        layout === "force" && isSmall
          ? { name: "circle", avoidOverlap: true, spacingFactor: 1.8, padding: 80, animate: false }
          : layout === "hierarchical"
          ? { name: "dagre", rankDir: "LR", nodeSep: 90, rankSep: 160, animate: false }
          : {
              name: "fcose",
              quality: "default",
              randomize: subgraph.nodes.length > 40,
              // Labels are wider than nodes; spacing has to clear the labels.
              nodeSeparation: 170,
              idealEdgeLength: 190,
              animate: !prefersReducedMotion,
              animationDuration: 320,
            }
      ) as unknown as LayoutOptions;

      // Fit once the layout settles, not while it animates, and never blow a
      // small neighbourhood up to fill the canvas.
      const run = cy.layout(layoutOptions);
      run.one("layoutstop", () => {
        cy.fit(undefined, 60);
        if (cy.zoom() > 1.15) {
          cy.zoom(1.15);
          cy.center();
        }
      });
      run.run();
    }, [subgraph, colorKeys, layout, isReady, nodeById]);

    /* Style, re-applied when the theme flips. */
    React.useEffect(() => {
      const cy = cyRef.current;
      if (!cy || !isReady) return;

      const chrome = graphChrome(isDark);
      const stylesheet: StylesheetStyle[] = [
        {
          selector: "node",
          style: {
            width: 34,
            height: 34,
            "background-color": (element: NodeSingular) =>
              graphColor(String(element.data("colorKey")), isDark).base,
            "border-width": 2,
            "border-color": chrome.edge,
            label: "data(label)",
            "font-size": 10,
            color: (element: NodeSingular) =>
              graphColor(String(element.data("colorKey")), isDark).label,
            "text-valign": "bottom",
            "text-margin-y": 6,
            "text-wrap": "ellipsis",
            "text-max-width": "150px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": chrome.edge,
            "target-arrow-color": chrome.edge,
            "target-arrow-shape": "triangle",
            "arrow-scale": 0.8,
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": 8,
            color: chrome.edgeLabel,
            "text-rotation": "autorotate",
          },
        },
        {
          // Historical edges stay visible, dashed and dimmed.
          selector: "edge[current = 0]",
          style: {
            "line-style": "dashed",
            "line-color": chrome.historicalEdge,
            "target-arrow-color": chrome.historicalEdge,
          },
        },
        {
          selector: ".cerevia-selected",
          style: { "border-width": 4, "border-color": chrome.selection },
        },
        {
          selector: ".cerevia-highlighted",
          style: {
            "line-color": chrome.highlight,
            "target-arrow-color": chrome.highlight,
            "border-color": chrome.highlight,
            width: 3,
            "z-index": 20,
          },
        },
        { selector: ".cerevia-dimmed", style: { opacity: 0.2 } },
      ] as unknown as StylesheetStyle[];

      cy.style(stylesheet);
    }, [isDark, isReady, subgraph]);

    /* Selection and path highlighting. */
    React.useEffect(() => {
      const cy = cyRef.current;
      if (!cy || !isReady) return;

      cy.batch(() => {
        cy.elements().removeClass("cerevia-selected cerevia-highlighted cerevia-dimmed");

        if (highlightedIds && highlightedIds.size > 0) {
          cy.elements().addClass("cerevia-dimmed");
          for (const id of highlightedIds) {
            cy.getElementById(id).removeClass("cerevia-dimmed").addClass("cerevia-highlighted");
          }
        }

        if (selectedNodeId) cy.getElementById(selectedNodeId).addClass("cerevia-selected");
        if (selectedEdgeId) cy.getElementById(selectedEdgeId).addClass("cerevia-highlighted");
      });
    }, [selectedNodeId, selectedEdgeId, highlightedIds, isReady, subgraph]);

    return (
      <div className={cn("relative overflow-hidden rounded-md border border-border bg-card", className)}>
        {!isReady && (
          <div className="absolute inset-0 p-4">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" aria-hidden="true" role="presentation" />
      </div>
    );
  },
);

function center(cy: Core): { x: number; y: number } {
  return { x: cy.width() / 2, y: cy.height() / 2 };
}
