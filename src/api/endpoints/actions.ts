/** Action proposals and approvals. */

import { api } from "@/api/client";
import type {
  ActionProposal,
  CreateProposalResult,
  Page,
  PageParams,
  ProposalKind,
} from "@/api/types";

export function listProposals(params: PageParams = {}): Promise<Page<ActionProposal>> {
  return api.get<Page<ActionProposal>>("/api/v1/actions/proposals", { params: { ...params } });
}

export function createProposal(
  body: { kind: ProposalKind; context?: { projectId?: string; messageId?: string } },
  idempotencyKey?: string,
): Promise<CreateProposalResult> {
  return api.post<CreateProposalResult>("/api/v1/actions/proposals", body, { idempotencyKey });
}

export function getProposal(id: string): Promise<ActionProposal> {
  return api.get<ActionProposal>(`/api/v1/actions/proposals/${encodeURIComponent(id)}`);
}

export function updateProposal(id: string, content: string): Promise<ActionProposal> {
  return api.patch<ActionProposal>(`/api/v1/actions/proposals/${encodeURIComponent(id)}`, {
    content,
  });
}

export function approveProposal(id: string, confirmation?: string): Promise<ActionProposal> {
  return api.post<ActionProposal>(
    `/api/v1/actions/proposals/${encodeURIComponent(id)}/approve`,
    { confirmation },
  );
}

export function rejectProposal(id: string, reason: string): Promise<ActionProposal> {
  return api.post<ActionProposal>(`/api/v1/actions/proposals/${encodeURIComponent(id)}/reject`, {
    reason,
  });
}
