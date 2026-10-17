"use client";

import * as React from "react";
import {
  Sparkles,
  Layers,
  Palette,
  Type,
  Box,
  Sliders,
  FolderSearch,
  ShieldCheck,
  GitMerge,
  Copy,
  Check,
  Send,
  Trash2,
  Plus,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  AccessDeniedState,
} from "@/components/feedback";
import { GraphCanvas, GraphControls, NodeInspector } from "@/components/graph";
import { MOCK_GRAPH_DATA } from "@/mocks/graph";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { SourcePreview } from "@/components/evidence/SourcePreview";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { ThemeToggle } from "@/components/theme-toggle";
import { COLOR_TOKENS, EVIDENCE_STATES_CONFIG, ENTITY_TYPES_CONFIG } from "@/config/tokens";
import { EvidenceState, EntityType, SourceDocument, EvidenceClaim, GraphNode } from "@/types";

export default function DesignSystemPage() {
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [previewDoc, setPreviewDoc] = React.useState<SourceDocument | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // Graph interactive demo states
  const [graphZoom, setGraphZoom] = React.useState(1);
  const [graphFilter, setGraphFilter] = React.useState<EntityType | "all">("all");
  const [graphSearch, setGraphSearch] = React.useState("");
  const [selectedGraphNode, setSelectedGraphNode] = React.useState<GraphNode | null>(MOCK_GRAPH_DATA.nodes[0]);

  // Form interactive demo states
  const [inputVal, setInputVal] = React.useState("Autonomous Agent Architecture");
  const [inputError, setInputError] = React.useState("");
  const [switchChecked, setSwitchChecked] = React.useState(true);
  const [checkboxChecked, setCheckboxChecked] = React.useState(true);
  const [selectVal, setSelectVal] = React.useState("falkordb");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    toast.success(`Copied to clipboard: ${text}`);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const sampleSourceDoc: SourceDocument = {
    id: "DOC-FALKOR-01",
    title: "ADR-104: FalkorDB Graph Selection & Benchmark Evaluation",
    type: "confluence",
    author: "Dr. Elena Vance",
    authorRole: "Principal Systems Architect",
    sourceUrl: "https://wiki.cerevia.internal/adr-104",
    lastUpdated: "October 14, 2026",
    reliabilityScore: 97,
    section: "Section 4.2: Redis Module Multi-Hop Throughput",
    snippet:
      "Under heavy multi-tenant indexing tests, FalkorDB demonstrated consistent sub-12ms response times for 6-hop Cypher queries. Memory utilization remained bounded under 4GB for 500k triples.",
    highlightedText:
      "FalkorDB demonstrated consistent sub-12ms response times for 6-hop Cypher queries.",
  };

  const sampleClaim: EvidenceClaim = {
    id: "CLM-GRAPH-88",
    claim:
      "Cytoscape graph rendering was approved for real-time visualization over D3 due to native Canvas WebGL fallback.",
    state: "inferred",
    confidenceScore: 88,
    rationale:
      "Synthesized from Frontend RFC-88 and PR review discussions across the UI platform and Graphics engineering teams.",
    citations: [
      {
        id: "cit-10",
        code: "RFC-88",
        label: "Canvas & WebGL rendering benchmarks",
        documentTitle: "Frontend Streaming Architecture RFC",
        sourceType: "github",
        snippet: "Cytoscape canvas rendering outperformed SVG alternatives at 10,000 nodes.",
      },
      {
        id: "cit-11",
        code: "PR-412",
        label: "Initial graph view port integration",
        documentTitle: "Cerevia Frontend Repository PR #412",
        sourceType: "github",
      },
    ],
    graphPath: ["Decision #098", "implements", "RFC-88", "authoredBy", "Habib Adavize"],
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Cerevia Design System
            </h1>
            <Badge variant="default" className="font-mono text-[10px]">
              v1.0.0
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Centralized design token foundation, accessible Radix UI primitives, and knowledge-specific evidence components built for Cerevia’s enterprise AI and FalkorDB graph workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="outline" />
          <Button
            size="sm"
            onClick={() => {
              toast("Design System Ready", {
                description: "All design tokens and 25 UI primitives are validated.",
              });
            }}
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          >
            Trigger Toast
          </Button>
        </div>
      </div>

      {/* Tabs Navigation for Showcase Categories */}
      <Tabs defaultValue="evidence" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto p-1 gap-1">
          <TabsTrigger value="evidence" className="text-xs py-1.5">
            1. Evidence &amp; Graph
          </TabsTrigger>
          <TabsTrigger value="tokens" className="text-xs py-1.5">
            2. Color Tokens
          </TabsTrigger>
          <TabsTrigger value="buttons" className="text-xs py-1.5">
            3. Buttons &amp; Badges
          </TabsTrigger>
          <TabsTrigger value="forms" className="text-xs py-1.5">
            4. Inputs &amp; Forms
          </TabsTrigger>
          <TabsTrigger value="dialogs" className="text-xs py-1.5">
            5. Overlays &amp; Menus
          </TabsTrigger>
          <TabsTrigger value="states" className="text-xs py-1.5">
            6. Feedback States
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs py-1.5">
            7. Tables &amp; Nav
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Evidence & Graph System */}
        <TabsContent value="evidence" className="space-y-8 mt-6">
          {/* Section: Evidence Badges */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Evidence Verification Badges (`EvidenceBadge`)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each state has a distinct icon, label, and visual treatment (solid, dashed, dotted borders). A hypothesis is prominently marked as an unverified possibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(EVIDENCE_STATES_CONFIG) as EvidenceState[]).map((state) => {
                const conf = EVIDENCE_STATES_CONFIG[state];
                return (
                  <Card key={state} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <EvidenceBadge state={state} size="default" />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {conf.confidenceRange}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {conf.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Section: Citation Chips & Source Preview */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Box className="h-4 w-4 text-primary" />
                Citation Chips &amp; Interactive Source Drawer (`CitationChip`, `SourcePreview`)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click any citation chip below to inspect the document metadata and highlighted ingested passage in the slide-over drawer.
              </p>
            </div>

            <Card className="p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <CitationChip
                  citation={{
                    id: "c-1",
                    code: "ADR-104",
                    label: "FalkorDB Sub-millisecond latency results",
                    documentTitle: "Architecture Decision: Graph Store Selection",
                    sourceType: "confluence",
                  }}
                  previewSource={sampleSourceDoc}
                  onOpenPreview={() => {
                    setPreviewDoc(sampleSourceDoc);
                    setPreviewOpen(true);
                  }}
                />

                <CitationChip
                  citation={{
                    id: "c-2",
                    code: "PRD-2026.1 §3",
                    label: "Conversational UI citation requirements",
                    documentTitle: "Cerevia Knowledge Platform PRD",
                    sourceType: "google_doc",
                  }}
                  previewSource={{
                    ...sampleSourceDoc,
                    id: "PRD-2026.1",
                    title: "Cerevia Product Requirements Document Q1",
                    type: "google_doc",
                    section: "Section 3: Assistant Interface",
                    snippet: "Every generated response must provide verifiable citations linked to FalkorDB nodes.",
                    highlightedText: "Every generated response must provide verifiable citations.",
                  }}
                  onOpenPreview={(c) => {
                    setPreviewDoc({
                      ...sampleSourceDoc,
                      id: c.code,
                      title: c.documentTitle,
                      type: c.sourceType,
                    });
                    setPreviewOpen(true);
                  }}
                />

                <CitationChip
                  citation={{
                    id: "c-3",
                    code: "Slack #eng-arch",
                    label: "Sync discussion on Cypher edge indexing",
                    documentTitle: "Slack Engineering Channel Thread",
                    sourceType: "slack",
                  }}
                  onOpenPreview={(c) => {
                    setPreviewDoc({
                      ...sampleSourceDoc,
                      id: c.code,
                      title: c.documentTitle,
                      type: "slack",
                      author: "Sarah Chen (Infra)",
                      snippet: "Edge indexing in FalkorDB gave us 3x speedup on path queries.",
                      highlightedText: "Edge indexing in FalkorDB gave us 3x speedup.",
                    });
                    setPreviewOpen(true);
                  }}
                />

                <CitationChip
                  citation={{
                    id: "c-4",
                    code: "PR #412 §src",
                    label: "Cytoscape WebGL canvas integration commit",
                    documentTitle: "Cerevia Frontend Repository Pull Request",
                    sourceType: "github",
                  }}
                  onOpenPreview={(c) => {
                    setPreviewDoc({
                      ...sampleSourceDoc,
                      id: c.code,
                      title: c.documentTitle,
                      type: "github",
                      author: "Habib Adavize",
                      snippet: "Refactored graph canvas to use Cytoscape WebGL renderer fallback.",
                      highlightedText: "Refactored graph canvas to use Cytoscape WebGL renderer.",
                    });
                    setPreviewOpen(true);
                  }}
                />
              </div>

              <p className="text-xs text-muted-foreground italic">
                Tip: CitationChips provide instant tooltips on hover and trigger the detailed SourcePreview sheet upon click.
              </p>
            </Card>
          </div>

          {/* Section: EvidencePanel */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Comprehensive Evidence Container (`EvidencePanel`)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Container displaying a claim, primary verification badge, confidence score, source citations, and graph path trace.
              </p>
            </div>
            <EvidencePanel claim={sampleClaim} collapsible />
          </div>

          {/* Section: Graph Entity Badges */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <GitMerge className="h-4 w-4 text-primary" />
                Graph Entity Badges (`EntityBadge`)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Representing the core entities tracked across the company: Person, Team, Project, Decision, and Document.
              </p>
            </div>

            <Card className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(ENTITY_TYPES_CONFIG) as EntityType[]).map((type) => {
                  const conf = ENTITY_TYPES_CONFIG[type];
                  return (
                    <div
                      key={type}
                      className="p-3 rounded-md border border-border/70 bg-card space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <EntityBadge type={type} name={conf.label} size="default" />
                        <span className="font-mono text-[10px] text-muted-foreground uppercase">
                          {type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {conf.description}
                      </p>
                      <div className="pt-1 flex items-center gap-1.5">
                        <EntityBadge
                          type={type}
                          name={
                            type === "person"
                              ? "Dr. Elena Vance"
                              : type === "team"
                              ? "Infra Architecture"
                              : type === "project"
                              ? "Apollo Engine"
                              : type === "decision"
                              ? "ADR-104 Graph Store"
                              : "Graph_RFC_v2.md"
                          }
                          subtitle={type === "person" ? "Lead" : undefined}
                          size="sm"
                          clickable
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Section: Interactive Graph Canvas & Controls */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                Knowledge Graph Canvas &amp; Controls (`GraphCanvas`, `GraphControls`, `NodeInspector`)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Restrained, non-neon canvas visualization with pan/zoom, dynamic entity category styling, relation labels, and slide-out node inspector.
              </p>
            </div>
            <GraphControls
              zoom={graphZoom}
              onZoomChange={setGraphZoom}
              onResetZoom={() => setGraphZoom(1)}
              filterType={graphFilter}
              onFilterChange={setGraphFilter}
              searchQuery={graphSearch}
              onSearchChange={setGraphSearch}
              nodeCount={MOCK_GRAPH_DATA.nodes.length}
              edgeCount={MOCK_GRAPH_DATA.edges.length}
            />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className={selectedGraphNode ? "lg:col-span-3" : "lg:col-span-4"}>
                <GraphCanvas
                  data={MOCK_GRAPH_DATA}
                  selectedNodeId={selectedGraphNode?.id || null}
                  onSelectNode={setSelectedGraphNode}
                  zoom={graphZoom}
                  filterType={graphFilter}
                  className="h-[460px]"
                />
              </div>
              {selectedGraphNode && (
                <div className="lg:col-span-1 h-[460px]">
                  <NodeInspector
                    node={selectedGraphNode}
                    edges={MOCK_GRAPH_DATA.edges}
                    allNodes={MOCK_GRAPH_DATA.nodes}
                    onClose={() => setSelectedGraphNode(null)}
                    onNavigateToNode={(nodeId) => {
                      const found = MOCK_GRAPH_DATA.nodes.find((n) => n.id === nodeId);
                      if (found) setSelectedGraphNode(found);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Color Tokens & Palette */}
        <TabsContent value="tokens" className="space-y-6 mt-6">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Centralized CSS Design Tokens
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Defined via CSS custom properties in `src/app/globals.css`. Click any swatch to copy the token variable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {COLOR_TOKENS.map((token) => (
              <button
                key={token.variable}
                type="button"
                onClick={() => copyToClipboard(`var(${token.variable})`)}
                className="flex flex-col p-3 rounded-lg border border-border bg-card hover:border-primary/40 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="h-8 w-full rounded-md border border-border/50 shadow-2xs"
                    style={{ backgroundColor: `hsl(var(${token.variable}))` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {token.name}
                  </span>
                  {copiedToken === `var(${token.variable})` ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  var({token.variable})
                </span>
                <span className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                  {token.role}
                </span>
              </button>
            ))}
          </div>

          {/* Typography Scale */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              Typography Scale &amp; Monospace Technical Identifiers
            </h3>
            <div className="space-y-3 divide-y divide-border/60">
              <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span className="text-2xl font-bold tracking-tight">
                  Heading 1: 24px Bold (Tracking Tight)
                </span>
                <span className="font-mono text-xs text-muted-foreground">text-2xl font-bold</span>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span className="text-lg font-semibold tracking-tight">
                  Heading 2: 18px Semibold (Tracking Tight)
                </span>
                <span className="font-mono text-xs text-muted-foreground">text-lg font-semibold</span>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span className="text-sm font-medium">
                  Body Text: 14px Medium Body Copy for Knowledge Workspaces
                </span>
                <span className="font-mono text-xs text-muted-foreground">text-sm font-medium</span>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  Caption &amp; Subtitle: 12px Regular Muted Caption
                </span>
                <span className="font-mono text-xs text-muted-foreground">text-xs text-muted-foreground</span>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span className="font-mono text-xs bg-muted/60 px-2 py-0.5 rounded border border-border">
                  Node ID: [falkordb://triple/decision#adr_104_eval_01]
                </span>
                <span className="font-mono text-xs text-muted-foreground">font-mono text-xs</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: Buttons & Badges */}
        <TabsContent value="buttons" className="space-y-6 mt-6">
          <Card className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Button Variants
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Standard button component supporting primary (default), secondary, outline, ghost, destructive, link, and success variants.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="default">Primary Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
              <Button variant="link">Link Button</Button>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Button Sizes &amp; States
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sizes: `sm`, `default`, `lg`, `icon`, plus `isLoading` and `disabled`.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small Size</Button>
              <Button size="default">Default Size</Button>
              <Button size="lg">Large Size</Button>
              <Button isLoading loadingText="Querying FalkorDB...">
                Submit
              </Button>
              <Button disabled>Disabled Button</Button>
              <Button leftIcon={<Plus className="h-4 w-4" />}>With Left Icon</Button>
              <Button rightIcon={<Send className="h-4 w-4" />}>With Right Icon</Button>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                IconButton Component (`IconButton`)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dedicated icon buttons with required `aria-label` for screen reader accessibility.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <IconButton icon={<Plus className="h-4 w-4" />} aria-label="Add Node" />
              <IconButton
                icon={<Trash2 className="h-4 w-4" />}
                variant="destructive"
                aria-label="Delete Record"
              />
              <IconButton
                icon={<Sliders className="h-4 w-4" />}
                variant="outline"
                aria-label="Filter Preferences"
              />
              <IconButton
                icon={<Sparkles className="h-4 w-4" />}
                variant="secondary"
                aria-label="AI Prompt"
              />
            </div>
          </Card>

          {/* Badges */}
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Semantic Badges (`Badge`)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Color-coded micro-labels for categorization, system states, and alerts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="muted">Muted</Badge>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 4: Inputs & Forms */}
        <TabsContent value="forms" className="space-y-6 mt-6">
          <Card className="p-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Form Inputs with Validation &amp; Labels
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inputs and textareas integrate built-in labels, helper descriptions, error states, and icon slots.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Knowledge Domain Topic"
                description="Specify the high-level topic cluster in the knowledge graph."
                placeholder="e.g. Distributed Consensus"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                required
              />

              <Input
                label="Validated Identifier"
                description="This input demonstrates error validation state."
                placeholder="e.g. ADR-001"
                value={inputError}
                onChange={(e) => setInputError(e.target.value)}
                error={inputError ? undefined : "Identifier cannot be empty. Please enter a valid record code."}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="graph-engine-select">Backend Graph Store</Label>
                <Select value={selectVal} onValueChange={setSelectVal}>
                  <SelectTrigger id="graph-engine-select">
                    <SelectValue placeholder="Select graph engine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Supported Graph Backends</SelectLabel>
                      <SelectItem value="falkordb">FalkorDB v0.4.2 (Active)</SelectItem>
                      <SelectItem value="redis-graph">RedisGraph Module</SelectItem>
                      <SelectItem value="custom-cypher">OpenCypher Protocol Endpoint</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Determines the query syntax dialect and multi-hop optimizer.
                </p>
              </div>

              <Textarea
                label="Executive Synthesis Summary"
                description="AI-generated description with human verification notes."
                placeholder="Write background rationale..."
                defaultValue="FalkorDB was benchmarked across 50,000 entities and selected due to sub-12ms latency on 6-hop queries."
                rows={3}
              />
            </div>

            <Separator />

            {/* Checkbox and Switch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/20">
                <Checkbox
                  id="demo-checkbox"
                  checked={checkboxChecked}
                  onCheckedChange={(checked) => setCheckboxChecked(Boolean(checked))}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="demo-checkbox" className="cursor-pointer">
                    Enable FalkorDB Multi-hop Deduplication
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically merges identical entities across disparate document ingestion sources.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="demo-switch" className="cursor-pointer">
                    Live Graph Syncing
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Stream real-time changes into Cytoscape explorer.
                  </p>
                </div>
                <Switch
                  id="demo-switch"
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 5: Overlays, Modals, Drawers */}
        <TabsContent value="dialogs" className="space-y-6 mt-6">
          <Card className="p-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Dialogs, Drawers, Dropdowns &amp; Tooltips
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Accessible Radix UI overlay primitives supporting keyboard trap, focus return, and smooth transitions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Dialog Trigger */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">Open Modal Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Verify Knowledge Claim</DialogTitle>
                    <DialogDescription>
                      You are about to promote this AI hypothesis to a Confirmed Fact in FalkorDB.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-2 space-y-2 text-xs">
                    <div className="p-3 rounded-md bg-muted/50 border space-y-1">
                      <span className="font-semibold text-foreground">Target Claim:</span>
                      <p className="text-muted-foreground">
                        &ldquo;FalkorDB benchmarked at 14x faster traversal latency than SQL.&rdquo;
                      </p>
                    </div>
                    <EvidenceBadge state="confirmed" size="sm" />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      size="sm"
                      onClick={() => {
                        setDialogOpen(false);
                        toast.success("Claim verified and recorded in FalkorDB.");
                      }}
                    >
                      Confirm Promotion
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Sheet / Drawer Trigger */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Side Drawer (Sheet)</Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Knowledge Graph Inspector</SheetTitle>
                    <SheetDescription>
                      Detailed inspection of connected node attributes and relational hops.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground">Node ID</span>
                      <p className="font-mono text-muted-foreground">falkordb://decision/adr_104</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground">Primary Owner</span>
                      <EntityBadge type="person" name="Dr. Elena Vance" size="sm" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground">Ingested Source</span>
                      <CitationChip
                        citation={{
                          id: "c-sheet",
                          code: "ADR-104",
                          label: "Official Confluence ADR",
                          documentTitle: "Architecture Decision Record 104",
                          sourceType: "confluence",
                        }}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Popover Trigger */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 space-y-2 text-xs">
                  <h4 className="font-semibold text-foreground">FalkorDB Node Metrics</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Graph density: 3.25 relationships per entity. Memory footprint: 1.4 GB.
                  </p>
                  <div className="pt-2 flex justify-end">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      View Raw Triples
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Dropdown Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuItem className="text-xs cursor-pointer">
                    Export Cypher Query
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer">
                    Re-index Knowledge Node
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive className="text-xs cursor-pointer">
                    Revoke Claim Verification
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tooltip */}
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost">Hover for Tooltip</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Accessible tooltip powered by Radix UI.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 6: Feedback & System States */}
        <TabsContent value="states" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Empty State */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Empty State (`EmptyState`)
              </h3>
              <EmptyState
                icon={<FolderSearch className="h-6 w-6" />}
                title="No knowledge sources found"
                description="No documents or external records have been connected to this project workspace yet."
                action={{
                  label: "Connect Data Source",
                  onClick: () => toast.info("Connect source dialog opened"),
                }}
              />
            </Card>

            {/* Error State */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Error State (`ErrorState`)
              </h3>
              <ErrorState
                title="FalkorDB Connection Timeout"
                message="The knowledge graph daemon did not respond within the 5000ms threshold. Please check the network bridge."
                code="ERR_FALKOR_TIMEOUT"
                onRetry={() => toast.loading("Attempting graph reconnect...")}
              />
            </Card>
          </div>

          {/* Loading State */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Loading State (`LoadingState`)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4 bg-card">
                <LoadingState
                  message="Computing Multi-Hop Graph Embeddings..."
                  subtext="Traversing 14,820 FalkorDB nodes"
                  variant="spinner"
                />
              </div>

              <div className="border rounded-md p-4 bg-card">
                <LoadingState variant="skeleton" />
              </div>
            </div>
          </Card>

          {/* Access Denied State */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Access Denied State (`AccessDeniedState`)
            </h3>
            <AccessDeniedState
              title="Restricted Architecture RFC Subgraph"
              requiredRole="Knowledge Steward"
              description="You do not have the required permissions to view internal compliance and cryptographic key material in this FalkorDB graph domain."
              onGoBack={() => toast.info("Navigating back...")}
              onRequestAccess={() => toast.success("Access request sent to workspace administrator.")}
            />
          </Card>
        </TabsContent>

        {/* TAB 7: Tables & Navigation */}
        <TabsContent value="data" className="space-y-6 mt-6">
          {/* Breadcrumbs */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Breadcrumb Navigation (`Breadcrumbs`)
            </h3>
            <div className="p-3 rounded-md bg-muted/40 border">
              <Breadcrumbs
                items={[
                  { label: "Acme Aerospace Workspace", href: "/" },
                  { label: "Knowledge Graph", href: "/graph" },
                  { label: "Architecture Subgraph Trace", isCurrent: true },
                ]}
              />
            </div>
          </Card>

          {/* Avatars */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              User &amp; Entity Avatars with Live Status (`Avatar`)
            </h3>
            <div className="flex items-center gap-4">
              <Avatar size="sm" status="online">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                  EV
                </AvatarFallback>
              </Avatar>
              <Avatar size="default" status="away">
                <AvatarFallback className="text-xs bg-emerald-500/10 text-emerald-700 font-bold">
                  SC
                </AvatarFallback>
              </Avatar>
              <Avatar size="lg" status="busy">
                <AvatarFallback className="text-sm bg-violet-500/10 text-violet-700 font-bold">
                  HA
                </AvatarFallback>
              </Avatar>
              <Avatar size="xl" status="offline">
                <AvatarFallback className="text-base bg-muted text-muted-foreground font-bold">
                  MH
                </AvatarFallback>
              </Avatar>
            </div>
          </Card>

          {/* Skeletons */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Skeleton Loading Placeholders (`Skeleton`)
            </h3>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </Card>

          {/* Data Table */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Data Grid (`Table`)
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Entity ID</TableHead>
                  <TableHead>Entity Label</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>FalkorDB Node Count</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">ENT-001</TableCell>
                  <TableCell className="font-medium">Infra Architecture Team</TableCell>
                  <TableCell><EntityBadge type="team" size="sm" /></TableCell>
                  <TableCell className="font-mono">1,420 nodes</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" className="h-6 text-xs">Inspect</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">ENT-002</TableCell>
                  <TableCell className="font-medium">FalkorDB Cluster Spec</TableCell>
                  <TableCell><EntityBadge type="document" size="sm" /></TableCell>
                  <TableCell className="font-mono">890 nodes</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" className="h-6 text-xs">Inspect</Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Global Source Preview Drawer */}
      <SourcePreview
        source={previewDoc}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
