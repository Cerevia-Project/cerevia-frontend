"use client";

import * as React from "react";
import { UserPlus, Shield, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: "active" | "invited";
  lastLogin: string;
}

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr-01",
    name: "Habib Adavize",
    email: "habib@cerevia.internal",
    role: "Admin",
    team: "Core Architecture",
    status: "active",
    lastLogin: "Just now",
  },
  {
    id: "usr-02",
    name: "Elena Rostova",
    email: "elena.rostova@cerevia.internal",
    role: "Knowledge Steward",
    team: "Core Platform",
    status: "active",
    lastLogin: "2 hours ago",
  },
  {
    id: "usr-03",
    name: "Marcus Chen",
    email: "marcus.chen@cerevia.internal",
    role: "Auditor",
    team: "Security & Compliance",
    status: "active",
    lastLogin: "Yesterday",
  },
  {
    id: "usr-04",
    name: "Devon Vance",
    email: "devon.vance@cerevia.internal",
    role: "Graph Explorer",
    team: "Infrastructure SRE",
    status: "active",
    lastLogin: "3 days ago",
  },
];

export function UsersView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              User Management
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              {MOCK_ADMIN_USERS.length} Members
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage workspace users, assign enterprise roles, and control intelligence access.
          </p>
        </div>

        <Button
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => toast.info("Invite modal opened.")}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {MOCK_ADMIN_USERS.map((user) => (
                <TableRow key={user.id} className="hover:bg-secondary/40">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.team}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-[11px] text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {user.lastLogin}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
