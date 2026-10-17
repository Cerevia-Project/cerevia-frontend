/**
 * Cerevia Type Definitions
 * Enterprise Knowledge & Intelligence System
 */

// Evidence state supported by Cerevia FalkorDB Knowledge Graph
export type EvidenceState =
  | "confirmed"
  | "inferred"
  | "hypothesis"
  | "conflicting"
  | "missing";

// Entity category recognized in the Knowledge Graph
export type EntityType =
  | "person"
  | "team"
  | "project"
  | "decision"
  | "document";

// Source document metadata
export interface SourceDocument {
  id: string;
  title: string;
  type: "confluence" | "google_doc" | "slack" | "jira" | "github" | "pdf" | "markdown";
  author: string;
  authorRole?: string;
  sourceUrl?: string;
  lastUpdated: string;
  reliabilityScore: number; // 0 - 100
  section?: string;
  snippet: string;
  highlightedText?: string;
}

// Interactive citation metadata
export interface Citation {
  id: string;
  code: string; // e.g. "DOC-402", "RFC-18 §2"
  label: string;
  documentTitle: string;
  sourceType: SourceDocument["type"];
  sourceUrl?: string;
  snippet?: string;
}

// Supporting evidence claim for EvidencePanel
export interface EvidenceClaim {
  id: string;
  claim: string;
  state: EvidenceState;
  confidenceScore: number; // 0 - 100
  rationale: string;
  citations: Citation[];
  graphPath?: string[]; // e.g. ["Decision #42", "supportedBy", "RFC-104", "authoredBy", "Team Infra"]
  counterEvidence?: string;
}

// Knowledge Graph Node
export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  description?: string;
  status?: string;
  evidenceState?: EvidenceState;
  confidence?: number;
  metadata?: Record<string, string | number>;
  x?: number;
  y?: number;
}

// Knowledge Graph Edge
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  confidence?: number;
  state?: EvidenceState;
}

// Knowledge Graph Structure
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Navigation Item
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "outline" | "success" | "warning";
  section?: "workspace" | "intelligence" | "management" | "system";
  exact?: boolean;
}

// User Profile for Application Shell
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  avatarUrl?: string;
  status: "online" | "away" | "busy" | "offline";
}

// Decision Record
export interface DecisionRecord {
  id: string;
  code: string;
  title: string;
  summary: string;
  status: "accepted" | "superseded" | "under_review" | "deprecated";
  date: string;
  owner: string;
  team: string;
  impactScore: "High" | "Medium" | "Low";
  evidenceState: EvidenceState;
  context: string;
  drivers: string[];
  optionsConsidered: {
    title: string;
    pros: string[];
    cons: string[];
    chosen?: boolean;
  }[];
  consequences: string[];
  relatedNodes?: string[];
  citations?: Citation[];
}

// Project Record
export interface ProjectRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  status: "active" | "planned" | "completed" | "at_risk";
  owner: string;
  team: string;
  progress: number;
  targetQuarter: string;
  relatedDecisionsCount: number;
  documentsCount: number;
  evidenceState: EvidenceState;
}

// Action Proposal
export interface ActionProposal {
  id: string;
  title: string;
  description: string;
  status: "pending_review" | "approved" | "executed" | "rejected";
  proposer: string;
  date: string;
  impact: string;
  riskLevel: "low" | "medium" | "high";
  evidenceState: EvidenceState;
  suggestedChanges: string[];
}
