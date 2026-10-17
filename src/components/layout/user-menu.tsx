"use client";

import * as React from "react";
import {
  User,
  Settings,
  Shield,
  Key,
  LogOut,
  ChevronDown,
} from "lucide-react";
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
import { UserProfile } from "@/types";

export interface UserMenuProps {
  user?: UserProfile;
}

const DEFAULT_USER: UserProfile = {
  id: "usr_01",
  name: "Habib Adavize",
  email: "habib@cerevia.internal",
  role: "Lead Knowledge Steward",
  team: "AI Architecture & Platform",
  status: "online",
};

export function UserMenu({ user = DEFAULT_USER }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer group"
          aria-label="User navigation menu"
        >
          <Avatar size="sm" status={user.status} className="h-7 w-7">
            <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
              HA
            </AvatarFallback>
          </Avatar>
          <div className="hidden xl:flex flex-col text-left text-xs leading-none">
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {user.name}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {user.role}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground hidden xl:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-semibold text-foreground">{user.name}</p>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-mono text-muted-foreground">
                {user.role}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-xs cursor-pointer">
            <User className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>Profile &amp; Activity</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs cursor-pointer">
            <Settings className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>Workspace Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs cursor-pointer">
            <Shield className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>Access &amp; Permissions</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs cursor-pointer">
            <Key className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>API &amp; FalkorDB Tokens</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive className="text-xs cursor-pointer">
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
