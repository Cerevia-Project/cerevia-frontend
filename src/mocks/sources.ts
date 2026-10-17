export interface IngestionJob {
  id: string;
  sourceName: string;
  connectorType: "confluence" | "google_doc" | "slack" | "jira" | "github" | "notion";
  status: "synced" | "syncing" | "failed" | "idle";
  lastSync: string;
  documentCount: number;
  entitiesExtracted: number;
  syncInterval: string;
  reliability: number;
  details?: string;
}

export const MOCK_INGESTION_JOBS: IngestionJob[] = [
  {
    id: "job-conf-01",
    sourceName: "Engineering Architecture Confluence",
    connectorType: "confluence",
    status: "synced",
    lastSync: "12 mins ago",
    documentCount: 1420,
    entitiesExtracted: 8940,
    syncInterval: "Every 1 hour",
    reliability: 98,
    details: "All 18 spaces indexed without parsing warnings.",
  },
  {
    id: "job-slack-02",
    sourceName: "Production Engineering #incidents & #architecture",
    connectorType: "slack",
    status: "syncing",
    lastSync: "Just now",
    documentCount: 52400,
    entitiesExtracted: 34100,
    syncInterval: "Streaming (Real-time)",
    reliability: 94,
    details: "Presidio PII filter active on 4 public channels.",
  },
  {
    id: "job-jira-03",
    sourceName: "Platform & Core Infra Jira",
    connectorType: "jira",
    status: "synced",
    lastSync: "45 mins ago",
    documentCount: 3890,
    entitiesExtracted: 14200,
    syncInterval: "Every 2 hours",
    reliability: 96,
    details: "Epics, ADR issues, and bug resolutions mapped to decision entities.",
  },
  {
    id: "job-gh-04",
    sourceName: "github.com/cerevia (Specs & RFCs)",
    connectorType: "github",
    status: "synced",
    lastSync: "2 hours ago",
    documentCount: 840,
    entitiesExtracted: 4320,
    syncInterval: "Webhook triggered",
    reliability: 99,
    details: "Markdown RFCs parsed with automatic header anchoring.",
  },
  {
    id: "job-gdoc-05",
    sourceName: "Executive Decisions & Security Audits",
    connectorType: "google_doc",
    status: "idle",
    lastSync: "1 day ago",
    documentCount: 215,
    entitiesExtracted: 1840,
    syncInterval: "Daily at 02:00 UTC",
    reliability: 91,
    details: "Google Workspace service account authorized.",
  },
];
