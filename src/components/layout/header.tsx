"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, Sparkles } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { CommandSearch } from "@/components/layout/command-search";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Global keyboard shortcut for ⌘K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute breadcrumbs from pathname
  const breadcrumbs: BreadcrumbItem[] = React.useMemo(() => {
    if (pathname === "/") {
      return [{ label: "Overview", isCurrent: true }];
    }
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const formatted = seg
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return {
        label: formatted,
        href: idx === segments.length - 1 ? undefined : href,
        isCurrent: idx === segments.length - 1,
      };
    });
  }, [pathname]);

  return (
    <>
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xs sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 select-none">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 max-w-[80vw]">
              <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
              <Sidebar
                isMobile
                onNavigate={() => setMobileOpen(false)}
                className="border-r-0 w-full"
              />
            </SheetContent>
          </Sheet>

          <div className="hidden sm:block">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>

        {/* Right: Quick Search, Intelligence Badge, Theme Toggle, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 h-8 px-3 rounded-md bg-muted/60 border border-border/70 hover:border-border text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
            aria-label="Search Cerevia knowledge graph"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Search knowledge graph...</span>
            <span className="md:hidden">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-background border rounded">
              ⌘K
            </kbd>
          </button>

          {/* AI Intelligence Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            <span>AI Reasoning Ready</span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <UserMenu />
        </div>
      </header>

      {/* Global Command Search Dialog */}
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
