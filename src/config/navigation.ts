export interface NavItem {
  title: string;
  href: string;
  icon: string;
  section: "workspace" | "intelligence" | "management" | "system";
  /** Shown when the session holds any of these; the server still enforces them. */
  permissions?: string[];
  exact?: boolean;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { title: "Overview", href: "/overview", icon: "LayoutDashboard", section: "workspace" },
  { title: "AI Assistant", href: "/assistant", icon: "BotMessageSquare", section: "workspace" },
  {
    title: "Knowledge Graph",
    href: "/graph",
    icon: "Network",
    section: "intelligence",
    permissions: ["documents:read"],
  },
  {
    title: "Projects & Risks",
    href: "/projects",
    icon: "FolderKanban",
    section: "intelligence",
    permissions: ["documents:read"],
  },
  {
    title: "Decisions & Evidence",
    href: "/decisions",
    icon: "Scale",
    section: "intelligence",
    permissions: ["documents:read"],
  },
  {
    title: "People & Teams",
    href: "/people",
    icon: "Users",
    section: "intelligence",
    permissions: ["documents:read"],
  },
  {
    title: "Knowledge Sources",
    href: "/sources",
    icon: "FileSpreadsheet",
    section: "intelligence",
    permissions: ["sources:read"],
  },
  {
    title: "Actions & Approvals",
    href: "/actions",
    icon: "CheckSquare",
    section: "management",
  },
  {
    title: "Admin & Permissions",
    href: "/admin",
    icon: "ShieldCheck",
    section: "management",
    permissions: [
      "admin:users",
      "admin:roles",
      "admin:sources",
      "admin:organization",
      "admin:audit",
    ],
  },
  { title: "Design System", href: "/design-system", icon: "Palette", section: "system" },
];

export const NAV_SECTION_TITLES: Record<NavItem["section"], string> = {
  workspace: "Workspace",
  intelligence: "Knowledge & graph",
  management: "Management",
  system: "Design foundation",
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Users",
    href: "/admin/users",
    icon: "Users",
    section: "management",
    permissions: ["admin:users"],
  },
  {
    title: "Roles",
    href: "/admin/roles",
    icon: "ShieldCheck",
    section: "management",
    permissions: ["admin:roles"],
  },
  {
    title: "Source access",
    href: "/admin/access",
    icon: "Key",
    section: "management",
    permissions: ["admin:sources"],
  },
  {
    title: "Audit log",
    href: "/admin/audit",
    icon: "ScrollText",
    section: "management",
    permissions: ["admin:audit"],
  },
];

export function isNavItemVisible(item: NavItem, can: (permission: string) => boolean): boolean {
  if (!item.permissions || item.permissions.length === 0) return true;
  return item.permissions.some(can);
}
