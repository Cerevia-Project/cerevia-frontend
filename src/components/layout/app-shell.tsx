"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0 h-full">
        <React.Suspense fallback={<div className="w-64 h-full bg-card border-r border-border" />}>
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
        </React.Suspense>
      </div>

      {/* Main App Body */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <React.Suspense fallback={<div className="h-14 border-b border-border bg-card/80" />}>
          <Header />
        </React.Suspense>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <React.Suspense fallback={<div className="h-32 rounded-md bg-secondary animate-pulse" />}>
              {children}
            </React.Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
