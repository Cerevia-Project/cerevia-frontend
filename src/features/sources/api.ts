"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sourcesApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { IngestionJob, PageParams } from "@/api/types";

const JOB_POLL_INTERVAL = 3_000;

export function useSources(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.sources.list(params),
    queryFn: () => sourcesApi.listSources(params),
  });
}

export function useConnectors() {
  return useQuery({
    queryKey: queryKeys.connectors,
    queryFn: sourcesApi.listConnectors,
    staleTime: 10 * 60_000,
  });
}

export function useDocuments(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.documents.list(params),
    queryFn: () => sourcesApi.listDocuments(params),
  });
}

export function useDocument(id: string | null) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id ?? ""),
    queryFn: () => sourcesApi.getDocument(id as string),
    enabled: Boolean(id),
  });
}

export function useDocumentContent(id: string | null, chunk?: string) {
  return useQuery({
    queryKey: queryKeys.documents.content(id ?? "", chunk),
    queryFn: () => sourcesApi.getDocumentContent(id as string, chunk),
    enabled: Boolean(id),
  });
}

export function useIngestionJobs(params: PageParams = {}) {
  return useQuery({
    queryKey: queryKeys.ingestion.list(params),
    queryFn: () => sourcesApi.listIngestionJobs(params),
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some(isJobActive) ? JOB_POLL_INTERVAL : false;
    },
  });
}

export function useIngestionJob(id: string) {
  return useQuery({
    queryKey: queryKeys.ingestion.detail(id),
    queryFn: () => sourcesApi.getIngestionJob(id),
    enabled: Boolean(id),
    refetchInterval: (query) => (isJobActive(query.state.data) ? JOB_POLL_INTERVAL : false),
  });
}

export function isJobActive(job?: IngestionJob): boolean {
  return job?.status === "queued" || job?.status === "running";
}

export function useCreateSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sourcesApi.createSource,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sources.all });
    },
  });
}

export function useUpdateSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      sourcesApi.updateSource(id, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sources.all });
    },
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sourcesApi.deleteSource(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sources.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useRetryIngestionJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sourcesApi.retryIngestionJob(id),
    onSuccess: (_result, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ingestion.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ingestion.all });
    },
  });
}

export function useLoadDemoData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sourcesApi.loadDemoData,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ingestion.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sources.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.overview });
    },
  });
}

export interface UploadEntry {
  key: string;
  file: File;
  status: "pending" | "uploading" | "accepted" | "failed";
  jobId?: string;
  error?: string;
}

export function useUpload(sourceId: string | null) {
  const queryClient = useQueryClient();
  const [entries, setEntries] = React.useState<UploadEntry[]>([]);

  const update = React.useCallback((key: string, patch: Partial<UploadEntry>) => {
    setEntries((current) =>
      current.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry)),
    );
  }, []);

  const upload = React.useCallback(
    async (files: File[]) => {
      if (!sourceId) return;

      const queued: UploadEntry[] = files.map((file) => ({
        key: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        status: "pending",
      }));
      setEntries((current) => [...queued, ...current]);

      for (const entry of queued) {
        update(entry.key, { status: "uploading" });
        try {
          const { jobId } = await sourcesApi.uploadDocument(sourceId, entry.file, entry.key);
          update(entry.key, { status: "accepted", jobId });
        } catch (error) {
          update(entry.key, {
            status: "failed",
            error: error instanceof Error ? error.message : "Upload failed.",
          });
        }
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.ingestion.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
    [sourceId, queryClient, update],
  );

  const clear = React.useCallback(() => setEntries([]), []);

  return { entries, upload, clear, isUploading: entries.some((e) => e.status === "uploading") };
}
