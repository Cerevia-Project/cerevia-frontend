"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, ChevronDown, LogOut, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/providers/session-provider";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu() {
  const { session, roles, can, logout } = useSession();

  if (!session) {
    return <Skeleton className="h-7 w-7 rounded-full" />;
  }

  const { user, organization } = session;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex cursor-pointer items-center gap-2 rounded-full p-1 pl-1.5 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <Avatar size="sm" className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden flex-col text-left text-xs leading-none xl:flex">
            <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
              {user.name}
            </span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">{organization.name}</span>
          </span>
          <ChevronDown className="hidden h-3 w-3 text-muted-foreground xl:block" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-semibold text-foreground">{user.name}</p>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
            <p className="flex items-center gap-1.5 pt-1 font-mono text-[10px] text-muted-foreground">
              <Building2 className="h-3 w-3" aria-hidden="true" />
              {organization.name}
            </p>
            {roles.length > 0 && (
              <p className="font-mono text-[10px] text-muted-foreground">
                {roles.join(" · ")}
              </p>
            )}
          </div>
        </DropdownMenuLabel>

        {can("admin:users") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer text-xs">
                <Link href="/admin/users">
                  <Shield className="mr-2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  <span>Administration</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          destructive
          className="cursor-pointer text-xs"
          onSelect={() => void logout()}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
