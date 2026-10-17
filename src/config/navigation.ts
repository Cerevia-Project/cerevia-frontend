import { NavItem } from "@/types";

export const NAVIGATION_ITEMS: NavItem[] = [
  // Workspace
  {
    title: "Overview",
    href: "/overview",
    icon: "LayoutDashboard",
    section: "workspace",
    exact: false,
  },
  {
    title: "AI Assistant",
    href: "/assistant",
    icon: "BotMessageSquare",
    badge: "Beta",
    badgeVariant: "default",
    section: "workspace",
  },
  {
    title: "Knowledge Graph",
    href: "/graph",
    icon: "Network",
    badge: "FalkorDB",
    badgeVariant: "secondary",
    section: "intelligence",
  },
  {
    title: "Projects & Risks",
    href: "/projects",
    icon: "FolderKanban",
    section: "intelligence",
  },
  {
    title: "Decisions & Evidence",
    href: "/decisions",
    icon: "Scale",
    section: "intelligence",
  },
  {
    title: "People & Teams",
    href: "/people",
    icon: "Users",
    section: "intelligence",
  },
  {
    title: "Knowledge Sources",
    href: "/sources",
    icon: "FileSpreadsheet",
    badge: "1.2k docs",
    badgeVariant: "outline",
    section: "intelligence",
  },
  // Management
  {
    title: "Actions & Approvals",
    href: "/actions",
    icon: "CheckSquare",
    badge: 3,
    badgeVariant: "warning",
    section: "management",
  },
  {
    title: "Admin & Permissions",
    href: "/admin",
    icon: "ShieldCheck",
    section: "management",
  },
  // System / Developer Showcase
  {
    title: "Design System",
    href: "/design-system",
    icon: "Palette",
    badge: "Showcase",
    badgeVariant: "success",
    section: "system",
  },
];

export const WORKSPACE_METRICS = {
  activeOrg: "Acme Aerospace",
  connectedNodes: "14,820",
  graphRelationships: "48,210",
  verifiedDecisions: "312",
  ingestedDocuments: "1,245",
  activeProjects: "28",
  pendingReviews: "14",
  graphEngine: "FalkorDB v0.4.2",
  status: "Synchronized",
};
