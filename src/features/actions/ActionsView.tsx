"use client";

import * as React from "react";
import Link from "next/link";
import { CheckSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { EmptyState, QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { usePermission } from "@/providers/session-provider";
import { useCreateProposal, useProposals } from "@/features/actions/api";
import { humanize, truncate } from "@/lib/formatters";
import type { ProposalKind, ProposalStatus } from "@/api/types";

export const PROPOSAL_STATUS_STYLES: Record<ProposalStatus, string> = {
  draft: "text-muted-foreground",
  pending_approval: "text-amber-900 dark:text-amber-300 border-amber-500/40 bg-amber-500/10",
  approved: "text-success border-success/30 bg-success/5",
  executing: "text-primary border-primary/30 bg-primary/5",
  executed: "text-success border-success/30 bg-success/5",
  failed: "text-[var(--destructive)] border-[var(--destructive-border)] bg-[var(--destructive-subtle)]",
  rejected: "text-muted-foreground",
};

const PROPOSAL_KINDS: ProposalKind[] = [
  "status_report",
  "meeting_summary",
  "follow_up_tasks",
  "handover_doc",
  "support_reply",
  "action_plan",
  "launch_readiness_report",
];

export function ActionsView() {
  const query = useProposals();
  const canCreate = usePermission("proposals:create");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Actions and approvals
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Drafts generated from the knowledge base, reviewed and approved by a person before
            anything leaves the system.
          </p>
        </div>
        {canCreate && <CreateProposalDialog />}
      </header>

      <QueryBoundary
        query={query}
        errorTitle="Could not load proposals"
        isEmpty={(page) => page.items.length === 0}
        empty={
          <EmptyState
            icon={<CheckSquare className="h-4 w-4" />}
            title="No proposals"
            description="Proposals appear here when the assistant suggests an action, or when you draft one."
          />
        }
      >
        {(page) => (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px] hover:bg-transparent">
                    <TableHead>Proposal</TableHead>
                    <TableHead className="w-[180px]">Kind</TableHead>
                    <TableHead className="w-[160px]">Status</TableHead>
                    <TableHead className="w-[90px]" />
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {page.items.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell className="text-foreground">
                        <span className="flex items-center gap-2">
                          <Link
                            href={`/actions/${encodeURIComponent(proposal.id)}`}
                            className="font-medium hover:text-primary"
                          >
                            {truncate(proposal.content || humanize(proposal.kind), 70)}
                          </Link>
                          {proposal.isSampleData && <SampleDataBadge />}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {humanize(proposal.kind)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${PROPOSAL_STATUS_STYLES[proposal.status] ?? ""}`}
                        >
                          {humanize(proposal.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                          <Link href={`/actions/${encodeURIComponent(proposal.id)}`}>Open</Link>
                        </Button>
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

function CreateProposalDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [kind, setKind] = React.useState<ProposalKind>("status_report");
  const create = useCreateProposal();

  return (
    <>
      <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        New proposal
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Draft a proposal</DialogTitle>
            <DialogDescription>
              The draft is assembled from the knowledge base. Nothing is sent anywhere until it is
              reviewed and approved.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Select value={kind} onValueChange={(value) => setKind(value as ProposalKind)}>
              <SelectTrigger className="h-9 text-xs" aria-label="Proposal kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPOSAL_KINDS.map((value) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {humanize(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={create.isPending}
              onClick={() =>
                create.mutate(
                  { kind },
                  {
                    onSuccess: ({ proposalId }) => {
                      toast.success("Draft proposal created.");
                      setOpen(false);
                      router.push(`/actions/${proposalId}`);
                    },
                  },
                )
              }
            >
              {create.isPending ? "Drafting…" : "Create draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
