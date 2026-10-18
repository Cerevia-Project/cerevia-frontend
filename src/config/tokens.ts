import type { EntityType, EvidenceKind } from "@/api/types";

export interface EvidenceConfig {
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
  colorVar: string;
  badgeClass: string;
  borderClass: string;
}

export const EVIDENCE_KIND_CONFIG: Record<EvidenceKind, EvidenceConfig> = {
  confirmed: {
    label: "Confirmed",
    shortLabel: "Confirmed",
    description: "Stated directly by a cited source document.",
    iconName: "ShieldCheck",
    colorVar: "--evidence-confirmed",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    borderClass: "border-l-emerald-500",
  },
  inferred: {
    label: "Inferred",
    shortLabel: "Inferred",
    description: "Derived by following relationships in the knowledge graph.",
    iconName: "GitMerge",
    colorVar: "--evidence-inferred",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
    borderClass: "border-l-blue-500",
  },
  hypothesis: {
    label: "Possible explanation",
    shortLabel: "Hypothesis",
    description: "A hypothesis, not an established fact. Shown as a possible explanation.",
    iconName: "Sparkles",
    colorVar: "--evidence-hypothesis",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 border-dashed",
    borderClass: "border-l-purple-500 border-dashed",
  },
  conflicting: {
    label: "Conflicting",
    shortLabel: "Conflicting",
    description: "Sources disagree. Neither side is presented as correct.",
    iconName: "AlertTriangle",
    colorVar: "--evidence-conflicting",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    borderClass: "border-l-amber-500",
  },
  missing: {
    label: "Missing",
    shortLabel: "Missing",
    description: "No supporting evidence was found for this statement.",
    iconName: "CircleHelp",
    colorVar: "--evidence-missing",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30",
    borderClass: "border-l-slate-400",
  },
};

export interface EntityConfig {
  label: string;
  description: string;
  iconName: string;
  colorVar: string;
  badgeClass: string;
}

export const ENTITY_TYPES_CONFIG: Record<EntityType, EntityConfig> = {
  employee: {
    label: "Person",
    description: "Employees, stakeholders, reviewers and document authors.",
    iconName: "User",
    colorVar: "--entity-person",
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30",
  },
  team: {
    label: "Team",
    description: "Squads, functional units and working groups.",
    iconName: "Users",
    colorVar: "--entity-team",
    badgeClass: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30",
  },
  department: {
    label: "Department",
    description: "Organizational divisions above the team level.",
    iconName: "Building2",
    colorVar: "--entity-team",
    badgeClass: "bg-violet-500/10 text-violet-800 dark:text-violet-300 border-violet-500/30",
  },
  project: {
    label: "Project",
    description: "Initiatives, epics and workstreams.",
    iconName: "FolderKanban",
    colorVar: "--entity-project",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  milestone: {
    label: "Milestone",
    description: "Dated checkpoints within a project.",
    iconName: "Flag",
    colorVar: "--entity-project",
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  },
  task: {
    label: "Task",
    description: "Units of work, including blocked ones.",
    iconName: "ListChecks",
    colorVar: "--entity-project",
    badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
  },
  issue: {
    label: "Issue",
    description: "Defects and problems raised against work.",
    iconName: "Bug",
    colorVar: "--warning",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
  },
  document: {
    label: "Document",
    description: "Specifications, RFCs, minutes and policies.",
    iconName: "FileText",
    colorVar: "--entity-document",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
  },
  meeting: {
    label: "Meeting",
    description: "Recorded discussions and their minutes.",
    iconName: "CalendarDays",
    colorVar: "--entity-team",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
  },
  decision: {
    label: "Decision",
    description: "Decision records, trade-offs and approvals.",
    iconName: "Scale",
    colorVar: "--entity-decision",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  customer: {
    label: "Customer",
    description: "External organizations the company serves.",
    iconName: "Handshake",
    colorVar: "--success",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  ticket: {
    label: "Ticket",
    description: "Support requests and their resolutions.",
    iconName: "Ticket",
    colorVar: "--warning",
    badgeClass: "bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-500/30",
  },
  policy: {
    label: "Policy",
    description: "Rules and standards the organization holds itself to.",
    iconName: "BookLock",
    colorVar: "--muted",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30",
  },
  system: {
    label: "System",
    description: "Services and components in the technical estate.",
    iconName: "Server",
    colorVar: "--muted",
    badgeClass: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/30",
  },
  action_item: {
    label: "Action item",
    description: "Follow-ups captured from meetings and reviews.",
    iconName: "CircleDot",
    colorVar: "--entity-project",
    badgeClass: "bg-lime-500/10 text-lime-800 dark:text-lime-300 border-lime-500/30",
  },
};

export const COLOR_TOKENS = [
  { name: "Primary", variable: "--primary", role: "Brand accent and key interactive elements" },
  { name: "Background", variable: "--background", role: "Page base neutral canvas" },
  { name: "Card", variable: "--card", role: "Elevated surfaces, panels, and modals" },
  { name: "Popover", variable: "--popover", role: "Floating menus, tooltips, and flyouts" },
  { name: "Secondary", variable: "--secondary", role: "Quiet buttons and secondary tags" },
  { name: "Muted", variable: "--muted", role: "Subtle backgrounds and separators" },
  { name: "Accent", variable: "--accent", role: "Hover states and highlighted items" },
  { name: "Destructive", variable: "--destructive", role: "Errors, deletions, and high-risk actions" },
  { name: "Border", variable: "--border", role: "Dividers and component boundaries" },
  { name: "Input", variable: "--input", role: "Form field borders and active controls" },
  { name: "Focus Ring", variable: "--ring", role: "Accessible keyboard focus indicators" },
  { name: "Success", variable: "--success", role: "Positive verification and confirmed claims" },
  { name: "Warning", variable: "--warning", role: "Alerts, divergent evidence, and caution" },
  { name: "Information", variable: "--info", role: "Neutral informational notifications" },
];
