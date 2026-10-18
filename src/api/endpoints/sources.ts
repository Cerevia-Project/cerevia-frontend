import { api, API_BASE_URL } from "@/api/client";
import type {
  Connector,
  DemoLoadResult,
  Document,
  DocumentContent,
  IngestionJob,
  Page,
  PageParams,
  RetryJobResult,
  Source,
  UploadResult,
} from "@/api/types";

export function listSources(params: PageParams = {}): Promise<Page<Source>> {
  return api.get<Page<Source>>("/api/v1/sources", { params: { ...params } });
}

export function createSource(body: {
  name: string;
  type: "upload" | "connector";
}): Promise<Source> {
  return api.post<Source>("/api/v1/sources", body);
}

export function updateSource(id: string, body: { name: string }): Promise<Source> {
  return api.patch<Source>(`/api/v1/sources/${encodeURIComponent(id)}`, body);
}

export function deleteSource(id: string): Promise<void> {
  return api.delete<void>(`/api/v1/sources/${encodeURIComponent(id)}`);
}

export function uploadDocument(
  sourceId: string,
  file: File,
  idempotencyKey?: string,
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  return api.post<UploadResult>(
    `/api/v1/sources/${encodeURIComponent(sourceId)}/uploads`,
    form,
    { idempotencyKey },
  );
}

export function listDocuments(params: PageParams = {}): Promise<Page<Document>> {
  return api.get<Page<Document>>("/api/v1/documents", { params: { ...params } });
}

export function getDocument(id: string): Promise<Document> {
  return api.get<Document>(`/api/v1/documents/${encodeURIComponent(id)}`);
}

export function getDocumentContent(id: string, chunk?: string): Promise<DocumentContent> {
  return api.get<DocumentContent>(`/api/v1/documents/${encodeURIComponent(id)}/content`, {
    params: { chunk },
  });
}

export function listIngestionJobs(params: PageParams = {}): Promise<Page<IngestionJob>> {
  return api.get<Page<IngestionJob>>("/api/v1/ingestion/jobs", { params: { ...params } });
}

export function getIngestionJob(id: string): Promise<IngestionJob> {
  return api.get<IngestionJob>(`/api/v1/ingestion/jobs/${encodeURIComponent(id)}`);
}

export function retryIngestionJob(id: string): Promise<RetryJobResult> {
  return api.post<RetryJobResult>(`/api/v1/ingestion/jobs/${encodeURIComponent(id)}/retry`);
}

export function ingestionEventsUrl(id: string): string {
  return `${API_BASE_URL}/api/v1/ingestion/jobs/${encodeURIComponent(id)}/events`;
}

export function listConnectors(): Promise<{ items: Connector[] }> {
  return api.get<{ items: Connector[] }>("/api/v1/connectors");
}

export function loadDemoData(): Promise<DemoLoadResult> {
  return api.post<DemoLoadResult>("/api/v1/demo/load");
}
