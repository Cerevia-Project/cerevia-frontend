"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Users,
  FolderKanban,
  Scale,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOCK_SEARCH_ITEMS = [
  {
    category: "Decisions",
    icon: Scale,
    title: "ADR-104: FalkorDB Graph Store Integration",
    href: "/decisions",
    badge: "Confirmed",
    badgeVariant: "success" as const,
  },
  {
    category: "Decisions",
    icon: Scale,
    title: "ADR-089: Multi-tenant RBAC Permissions Model",
    href: "/decisions",
    badge: "Inferred",
    badgeVariant: "info" as const,
  },
  {
    category: "Projects",
    icon: FolderKanban,
    title: "Project Apollo: Knowledge Ingestion Engine",
    href: "/projects",
    badge: "Active",
    badgeVariant: "default" as const,
  },
  {
    category: "Documents",
    icon: FileText,
    title: "RFC: Real-time Cytoscape Graph Streaming",
    href: "/sources",
    badge: "Doc",
    badgeVariant: "outline" as const,
  },
  {
    category: "People",
    icon: Users,
    title: "Dr. Elena Vance (Lead AI Architect)",
    href: "/people",
    badge: "Team Core",
    badgeVariant: "secondary" as const,
  },
  {
    category: "AI Query",
    icon: Sparkles,
    title: "Ask Cerevia Assistant: Why was FalkorDB chosen over Neo4j?",
    href: "/assistant",
    badge: "Prompt",
    badgeVariant: "warning" as const,
  },
];

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return MOCK_SEARCH_ITEMS;
    return MOCK_SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden rounded-xl border border-border shadow-2xl">
        <DialogTitle className="sr-only">Global Knowledge Search</DialogTitle>
        <div className="flex items-center px-4 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, entities, decisions, or ask Cerevia..."
            className="border-0 shadow-none focus-visible:ring-0 text-sm h-12 px-0 bg-transparent"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching knowledge records or entities found.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Knowledge Graph Results
              </div>
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-accent hover:text-accent-foreground text-left text-xs transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <div className="p-1 rounded bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate font-medium text-foreground">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={item.badgeVariant} size="sm">
                        {item.badge}
                      </Badge>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-border bg-muted/40 text-[11px] text-muted-foreground flex items-center justify-between px-3">
          <span>Search powered by FalkorDB Graph Index</span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span>Navigate: ↑ ↓</span>
            <span>Select: ↵</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
