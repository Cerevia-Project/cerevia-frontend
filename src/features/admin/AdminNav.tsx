"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS, isNavItemVisible } from "@/config/navigation";
import { useSession } from "@/providers/session-provider";
import { cn } from "@/lib/utils";

/** Admin sub-navigation. Tabs the role cannot use are not rendered. */
export function AdminNav() {
  const pathname = usePathname();
  const { can } = useSession();
  const items = ADMIN_NAV_ITEMS.filter((item) => isNavItemVisible(item, can));

  if (items.length <= 1) return null;

  return (
    <nav aria-label="Administration sections" className="flex flex-wrap gap-1 border-b border-border pb-2">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
