"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BotMessageSquare,
  Network,
  FolderKanban,
  Scale,
  Users,
  FileSpreadsheet,
  CheckSquare,
  ShieldCheck,
  Palette,
  ChevronLeft,
  ChevronRight,
  Database,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BotMessageSquare,
  Network,
  FolderKanban,
  Scale,
  Users,
  FileSpreadsheet,
  CheckSquare,
  ShieldCheck,
  Palette,
};

export interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  className,
  isMobile = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  const workspaceItems = NAVIGATION_ITEMS.filter((i) => i.section === "workspace");
  const intelligenceItems = NAVIGATION_ITEMS.filter((i) => i.section === "intelligence");
  const managementItems = NAVIGATION_ITEMS.filter((i) => i.section === "management");
  const systemItems = NAVIGATION_ITEMS.filter((i) => i.section === "system");

  const renderNavGroup = (title: string, items: typeof NAVIGATION_ITEMS) => (
    <div className="space-y-1 mb-4">
      {!collapsed && (
        <h5 className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 select-none">
          {title}
        </h5>
      )}
      {items.map((item) => {
        const Icon = ICON_MAP[item.icon] || Layers;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href ||
          (item.href === "/overview" && pathname === "/") ||
          (item.href !== "/" && pathname.startsWith(item.href));

        const linkContent = (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors group relative select-none",
              isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {!collapsed && (
              <>
                <span className="truncate flex-1">{item.title}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? "secondary" : item.badgeVariant || "outline"}
                    size="sm"
                    className={cn(
                      "ml-auto text-[10px] font-mono",
                      isActive && "bg-primary-foreground/20 text-primary-foreground border-transparent"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        );

        if (collapsed) {
          return (
            <TooltipProvider key={item.href} delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs flex items-center gap-2">
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="outline" size="sm" className="text-[9px]">
                      {item.badge}
                    </Badge>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return linkContent;
      })}
    </div>
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Brand & Wordmark */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border/80">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 overflow-hidden group"
        >
          {/* Logo Mark: Stylized Connected Node Icon */}
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-xs shrink-0 group-hover:opacity-90 transition-opacity">
            <Network className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground font-sans">
                CEREVIA
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono leading-none">
                Intelligence
              </span>
            </div>
          )}
        </Link>

        {!isMobile && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {renderNavGroup("Core Workspace", workspaceItems)}
        {renderNavGroup("Knowledge & Graph", intelligenceItems)}
        {renderNavGroup("Management", managementItems)}
        {renderNavGroup("Design Foundation", systemItems)}
      </div>

      {/* Bottom Graph Connection Pill 
      {!collapsed && (
        <div className="p-3 border-t border-border/60 bg-muted/20">
          <div className="p-2 rounded-md bg-muted/50 border border-border/60 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Database className="h-3 w-3 text-primary" />
                FalkorDB Graph
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              14,820 Nodes • 48.2k Rel
            </p>
          </div>
        </div>
      )}*/}
    </aside>
  );
}
