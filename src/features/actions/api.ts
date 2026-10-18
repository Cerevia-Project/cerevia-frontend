"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actionsApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { PageParams, ProposalKind } from "@/api/types";

export function useProposals(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.proposals.list(params),
    queryFn: () => actionsApi.listProposals(params),
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: queryKeys.proposals.detail(id),
    queryFn: () => actionsApi.getProposal(id),
    enabled: Boolean(id),
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      kind: ProposalKind;
      context?: { projectId?: string; messageId?: string };
    }) => actionsApi.createProposal(body, crypto.randomUUID()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
    },
  });
}

export function useUpdateProposal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => actionsApi.updateProposal(id, content),
    onSuccess: (proposal) => {
      queryClient.setQueryData(queryKeys.proposals.detail(id), proposal);
      void queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
    },
  });
}

export function useApproveProposal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (confirmation?: string) => actionsApi.approveProposal(id, confirmation),
    onSuccess: (proposal) => {
      queryClient.setQueryData(queryKeys.proposals.detail(id), proposal);
      void queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.audit() });
    },
  });
}

export function useRejectProposal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => actionsApi.rejectProposal(id, reason),
    onSuccess: (proposal) => {
      queryClient.setQueryData(queryKeys.proposals.detail(id), proposal);
      void queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.audit() });
    },
  });
}
