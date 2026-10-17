import { EvidenceClaim, SourceDocument, Citation } from "@/types";

export const MOCK_SOURCES: SourceDocument[] = [
  {
    id: "doc-arch-001",
    title: "RFC-204: Knowledge Graph Storage Architecture & FalkorDB Migration",
    type: "confluence",
    author: "Elena Rostova",
    authorRole: "Principal Data Architect",
    sourceUrl: "https://confluence.internal/wiki/spaces/ARCH/pages/89401",
    lastUpdated: "2026-09-14",
    reliabilityScore: 96,
    section: "3.2 Benchmark Latency vs Neo4j",
    snippet:
      "Evaluated graph query latency under 12k concurrent vector hybrid lookups. FalkorDB demonstrated a 4.2x throughput increase with sub-15ms p99 latency compared to traditional graph engines.",
    highlightedText: "sub-15ms p99 latency compared to traditional graph engines",
  },
  {
    id: "doc-sec-089",
    title: "SOC-2 Type II Compliance & PII Redaction Pipeline Audit",
    type: "google_doc",
    author: "Marcus Chen",
    authorRole: "Security & Compliance Lead",
    sourceUrl: "https://docs.google.com/document/d/1xK938jf02-pii-audit",
    lastUpdated: "2026-08-28",
    reliabilityScore: 92,
    section: "Data Retention & Encryption at Rest",
    snippet:
      "All automated ingestion pipelines must run through the Presidio redaction gateway prior to indexing in the vector embeddings store. Verified zero raw PII persistence across production indexes.",
    highlightedText: "Verified zero raw PII persistence across production indexes.",
  },
  {
    id: "doc-infra-412",
    title: "Q3 Distributed Cache Scalability Post-Mortem",
    type: "github",
    author: "Devon Vance",
    authorRole: "Staff Site Reliability Engineer",
    sourceUrl: "https://github.com/cerevia/infra-specs/pull/412",
    lastUpdated: "2026-10-02",
    reliabilityScore: 88,
    section: "Memory Pressure Mitigation",
    snippet:
      "Cluster evictions were traced to unbounded session cache allocations during batch re-indexing. Capped max tenant cache memory to 64GB with LRU policy.",
    highlightedText: "Capped max tenant cache memory to 64GB with LRU policy.",
  },
];

export const MOCK_CITATIONS: Citation[] = [
  {
    id: "cite-1",
    code: "RFC-204 §3.2",
    label: "RFC-204 Knowledge Graph",
    documentTitle: "RFC-204: Knowledge Graph Storage Architecture",
    sourceType: "confluence",
    sourceUrl: "https://confluence.internal/wiki/spaces/ARCH/pages/89401",
    snippet: "FalkorDB demonstrated 4.2x throughput with sub-15ms p99 latency.",
  },
  {
    id: "cite-2",
    code: "SOC2 §4.1",
    label: "SOC-2 Audit Compliance",
    documentTitle: "SOC-2 Type II Compliance & PII Redaction Pipeline Audit",
    sourceType: "google_doc",
    sourceUrl: "https://docs.google.com/document/d/1xK938jf02-pii-audit",
    snippet: "Verified zero raw PII persistence across production indexes.",
  },
  {
    id: "cite-3",
    code: "PR-412",
    label: "Infra Specs PR-412",
    documentTitle: "Q3 Distributed Cache Scalability Post-Mortem",
    sourceType: "github",
    sourceUrl: "https://github.com/cerevia/infra-specs/pull/412",
    snippet: "Capped max tenant cache memory to 64GB with LRU policy.",
  },
];

export const MOCK_EVIDENCE_CLAIMS: EvidenceClaim[] = [
  {
    id: "claim-1",
    claim: "FalkorDB was selected as the graph engine to sustain sub-15ms query latency for enterprise graph lookups.",
    state: "confirmed",
    confidenceScore: 98,
    rationale: "Directly ratified in RFC-204 following multi-tenant load testing benchmarks.",
    citations: [MOCK_CITATIONS[0]],
    graphPath: ["RFC-204", "evaluates", "FalkorDB", "approvedBy", "Architecture Review Board"],
  },
  {
    id: "claim-2",
    claim: "Customer data ingested from Slack channels undergoes zero-retention PII sanitization before vector embedding.",
    state: "confirmed",
    confidenceScore: 94,
    rationale: "Verified by Security & Compliance team during Q3 SOC-2 Type II audit.",
    citations: [MOCK_CITATIONS[1]],
    graphPath: ["Slack Connector", "routesThrough", "Presidio Gateway", "indexedIn", "Qdrant Vector DB"],
  },
  {
    id: "claim-3",
    claim: "Multi-tenant tenant memory quotas prevent runaway batch indexing evictions across clusters.",
    state: "inferred",
    confidenceScore: 82,
    rationale: "Implemented in PR-412 but pending 30-day continuous stress verification in production.",
    citations: [MOCK_CITATIONS[2]],
    graphPath: ["Batch Ingestion Job", "limitedBy", "Tenant Cache 64GB Quota"],
  },
  {
    id: "claim-4",
    claim: "Teams are planning to deprecate the legacy Elasticsearch vector fallback by end of Q4.",
    state: "hypothesis",
    confidenceScore: 56,
    rationale: "Mentioned during weekly platform sync; no formal RFC or decision record has been approved yet.",
    citations: [],
    counterEvidence: "Legacy search client still handles fallback queries during cluster maintenance windows.",
  },
];
