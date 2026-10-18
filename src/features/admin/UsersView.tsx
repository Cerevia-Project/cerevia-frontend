"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccessDeniedState, EmptyState, QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { AdminNav } from "@/features/admin/AdminNav";
import { usePermission } from "@/providers/session-provider";
import { useCreateUser, useUsers } from "@/features/admin/api";
import { fieldErrorMap } from "@/api/errors";

export function UsersView() {
  const canManage = usePermission("admin:users");
  const query = useUsers();

  if (!canManage) {
    return (
      <div className="space-y-4">
        <AdminNav />
        <AccessDeniedState description="Managing users requires the admin:users permission." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminNav />

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Users</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            People with access to this organization&apos;s workspace.
          </p>
        </div>
        <CreateUserDialog />
      </header>

      <QueryBoundary
        query={query}
        errorTitle="Could not load users"
        isEmpty={(data) => data.items.length === 0}
        empty={<EmptyState title="No users" description="This organization has no users yet." />}
      >
        {(data) => (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px] hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[220px]">User ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {data.items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-foreground">
                        <span className="flex items-center gap-2">
                          {user.name}
                          {user.isSampleData && <SampleDataBadge />}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {user.id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </QueryBoundary>
    </div>
  );
}

function CreateUserDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const create = useCreateUser();
  const fieldErrors = fieldErrorMap(create.error);

  return (
    <>
      <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
        Add user
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a user</DialogTitle>
            <DialogDescription>
              The user is added to this organization. Roles are assigned separately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="user-name" className="text-xs">
                Name
              </Label>
              <Input
                id="user-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-9 text-xs"
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-[var(--destructive)]">{fieldErrors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-email" className="text-xs">
                Email
              </Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-9 text-xs"
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-[var(--destructive)]">{fieldErrors.email}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!name.trim() || !email.trim() || create.isPending}
              onClick={() =>
                create.mutate(
                  { name: name.trim(), email: email.trim() },
                  {
                    onSuccess: (user) => {
                      toast.success(`${user.name} added.`);
                      setName("");
                      setEmail("");
                      setOpen(false);
                    },
                  },
                )
              }
            >
              {create.isPending ? "Adding…" : "Add user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
