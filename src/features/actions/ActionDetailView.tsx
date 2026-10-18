"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download, Info, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { CitationChip } from "@/components/evidence/CitationChip";
import { usePermission } from "@/providers/session-provider";
import {
  useApproveProposal,
  useProposal,
  useRejectProposal,
  useUpdateProposal,
} from "@/features/actions/api";
import { useAuditRecords } from "@/features/admin/api";
import { PROPOSAL_STATUS_STYLES } from "@/features/actions/ActionsView";
import { formatDateTime, humanize } from "@/lib/formatters";
import type { ActionProposal } from "@/api/types";

/** The lifecycle the contract defines, shown as a timeline. */
const LIFECYCLE = ["draft", "pending_approval", "approved", "executing", "executed"] as const;

export function ActionDetailView({ proposalId }: { proposalId: string }) {
  const query = useProposal(proposalId);

  return (
    <div className="max-w-5xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
        <Link href="/actions">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Back to actions
        </Link>
      </Button>

      <QueryBoundary
        query={query}
        errorTitle="Could not load this proposal"
        notFoundTitle="Proposal not found"
      >
        {(proposal) => <ProposalWorkspace proposal={proposal} />}
      </QueryBoundary>
    </div>
  );
}

function ProposalWorkspace({ proposal }: { proposal: ActionProposal }) {
  const canApprove = usePermission("actions:approve");
  const canEdit = usePermission("proposals:create");

  const update = useUpdateProposal(proposal.id);
  const [content, setContent] = React.useState(proposal.content);
  const isDraft = proposal.status === "draft" || proposal.status === "pending_approval";
  const isDirty = content !== proposal.content;

  // A saved draft replaces the editor's copy; adjusting during render avoids
  // a second pass where the textarea still shows the stale text.
  const [syncedContent, setSyncedContent] = React.useState(proposal.content);
  if (proposal.content !== syncedContent) {
    setSyncedContent(proposal.content);
    setContent(proposal.content);
  }

  const copy = async () => {
    await navigator.clipboard.writeText(proposal.content);
    toast.success("Draft copied to the clipboard.");
  };

  const download = () => {
    const blob = new Blob([proposal.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${proposal.kind}-${proposal.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {humanize(proposal.kind)}
            </h1>
            {proposal.isSampleData && <SampleDataBadge />}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-[10px] ${PROPOSAL_STATUS_STYLES[proposal.status]}`}>
              {humanize(proposal.status)}
            </Badge>
            <span className="font-mono text-[10px] text-muted-foreground">{proposal.id}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => void copy()}>
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Copy
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={download}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Markdown
          </Button>
          {canApprove && isDraft && <ApprovalDialog proposal={proposal} />}
          {canApprove && isDraft && <RejectDialog proposal={proposal} />}
        </div>
      </header>

      <Lifecycle status={proposal.status} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4">
              <CardTitle className="text-sm font-semibold">Draft</CardTitle>
              {canEdit && isDraft && isDirty && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setContent(proposal.content)}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    disabled={update.isPending}
                    onClick={() =>
                      update.mutate(content, { onSuccess: () => toast.success("Draft saved.") })
                    }
                  >
                    {update.isPending ? "Saving…" : "Save draft"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              {canEdit && isDraft ? (
                <Textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={16}
                  className="resize-y font-mono text-xs leading-relaxed"
                  aria-label="Proposal draft"
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {proposal.content}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border p-4">
              <CardTitle className="text-sm font-semibold">Rationale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <p className="text-xs leading-relaxed text-foreground">{proposal.rationale}</p>
              {proposal.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {proposal.citations.map((citation, index) => (
                    <CitationChip key={citation.id} citation={citation} index={index + 1} size="sm" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-start gap-2 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                No outbound connector is configured in this deployment, so an approved proposal
                stays an exportable draft. Approving it records the decision; it does not send
                anything.
              </p>
            </CardContent>
          </Card>

          <AuditTimeline proposalId={proposal.id} />
        </div>
      </div>
    </div>
  );
}

function Lifecycle({ status }: { status: ActionProposal["status"] }) {
  // Rejected and failed are terminal states outside the happy path.
  if (status === "rejected" || status === "failed") {
    return (
      <p className="rounded-md border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground">
        This proposal is {humanize(status).toLowerCase()} and will not progress further.
      </p>
    );
  }

  const currentIndex = LIFECYCLE.indexOf(status as (typeof LIFECYCLE)[number]);

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {LIFECYCLE.map((stage, index) => (
        <li key={stage} className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] ${
              index <= currentIndex
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {humanize(stage)}
          </span>
          {index < LIFECYCLE.length - 1 && (
            <span className="text-muted-foreground" aria-hidden="true">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * Approval requires an explicit confirmation, and states exactly what will
 * happen, so nobody approves by reflex.
 */
function ApprovalDialog({ proposal }: { proposal: ActionProposal }) {
  const [open, setOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const approve = useApproveProposal(proposal.id);

  const phrase = "APPROVE";
  const isConfirmed = confirmation.trim().toUpperCase() === phrase;

  return (
    <>
      <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Approve
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve this {humanize(proposal.kind).toLowerCase()}?</DialogTitle>
            <DialogDescription>
              Approving records your approval against this proposal and writes an audit entry. This
              deployment has no outbound connector, so the result stays an exportable draft: nothing
              is sent to anyone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <label htmlFor="confirm-approve" className="text-xs text-foreground">
              Type <span className="font-mono font-semibold">{phrase}</span> to confirm
            </label>
            <input
              id="confirm-approve"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-2 font-mono text-xs text-foreground"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!isConfirmed || approve.isPending}
              onClick={() =>
                approve.mutate(confirmation.trim(), {
                  onSuccess: () => {
                    toast.success("Proposal approved.");
                    setConfirmation("");
                    setOpen(false);
                  },
                })
              }
            >
              {approve.isPending ? "Approving…" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RejectDialog({ proposal }: { proposal: ActionProposal }) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const reject = useRejectProposal(proposal.id);

  return (
    <>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Reject
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this proposal?</DialogTitle>
            <DialogDescription>
              The reason is recorded in the audit trail alongside the rejection.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="Why is this being rejected?"
            className="resize-none text-xs"
            aria-label="Rejection reason"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!reason.trim() || reject.isPending}
              onClick={() =>
                reject.mutate(reason.trim(), {
                  onSuccess: () => {
                    toast.success("Proposal rejected.");
                    setReason("");
                    setOpen(false);
                  },
                })
              }
            >
              {reject.isPending ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Audit entries for this proposal. Hidden when the role cannot read audit. */
function AuditTimeline({ proposalId }: { proposalId: string }) {
  const canReadAudit = usePermission("audit:read");
  // The query lives in a child so it is never issued for a role the server
  // would refuse it to.
  if (!canReadAudit) return null;
  return <AuditEntries proposalId={proposalId} />;
}

function AuditEntries({ proposalId }: { proposalId: string }) {
  const audit = useAuditRecords({ limit: 50 });

  const entries = (audit.data?.items ?? []).filter((record) => record.resourceId === proposalId);

  return (
    <Card>
      <CardHeader className="border-b border-border p-4">
        <CardTitle className="text-sm font-semibold">Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {audit.isPending ? (
          <Skeleton className="h-16 w-full rounded-md" />
        ) : entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No audit entry references this proposal.</p>
        ) : (
          <ol className="space-y-2 border-l border-border pl-3">
            {entries.map((record) => (
              <li key={record.id} className="relative">
                <span
                  className="absolute -left-[17px] top-1.5 h-1.5 w-1.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <p className="text-xs text-foreground">{humanize(record.action)}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {record.actor} · {formatDateTime(record.timestamp)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
