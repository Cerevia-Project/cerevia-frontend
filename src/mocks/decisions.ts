import { DecisionRecord } from "@/types";
import { MOCK_CITATIONS } from "./evidence";

export const MOCK_DECISIONS: DecisionRecord[] = [
  {
    id: "dec-101",
    code: "ADR-042",
    title: "Migration from Neo4j to FalkorDB for Enterprise Graph Queries",
    summary:
      "Transition primary enterprise knowledge graph storage engine to FalkorDB on Redis to lower p99 latency below 15ms and support multi-tenant vector-graph indexing.",
    status: "accepted",
    date: "2026-08-15",
    owner: "Elena Rostova",
    team: "Core Platform",
    impactScore: "High",
    evidenceState: "confirmed",
    context:
      "As Cerevia scaled beyond 10 million entities across ingested Jira, Confluence, and Slack sources, graph traversals on our existing single-node Neo4j deployment suffered latency spikes up to 480ms during active user queries.",
    drivers: [
      "Sub-20ms p99 SLA required for AI Assistant live context lookups",
      "Seamless integration with in-memory Redis modules",
      "Reduced infrastructure footprint and licensing overhead",
    ],
    optionsConsidered: [
      {
        title: "Scale Neo4j Enterprise Cluster",
        pros: ["Familiar Cypher query dialect", "Mature ecosystem"],
        cons: ["High licensing cost", "Memory footprint 3x larger than required"],
        chosen: false,
      },
      {
        title: "Migrate to FalkorDB",
        pros: [
          "Redis-based GraphBLAS linear algebra engine",
          "4.2x higher query throughput in benchmarks",
          "Sub-15ms p99 latency under 12k concurrent vector lookups",
        ],
        cons: ["Smaller third-party plugin ecosystem compared to Neo4j"],
        chosen: true,
      },
      {
        title: "PostgreSQL with Apache AGE extension",
        pros: ["Unified relational and graph database"],
        cons: ["Failed benchmark targets under multi-hop traversal depths greater than 3"],
        chosen: false,
      },
    ],
    consequences: [
      "All Cypher query builders updated to FalkorDB protocol",
      "Graph synchronization worker latency reduced by 72%",
      "Memory usage decreased from 140GB to 38GB per cluster replica",
    ],
    relatedNodes: ["person-elena", "project-synapse", "doc-rfc204"],
    citations: [MOCK_CITATIONS[0]],
  },
  {
    id: "dec-102",
    code: "ADR-043",
    title: "Mandatory Ingestion PII Masking via Presidio Sanitization Gateway",
    summary:
      "Enforce inline PII redaction (names, social identifiers, API keys, credentials) before documents are saved to vector index or graph attributes.",
    status: "accepted",
    date: "2026-09-02",
    owner: "Marcus Chen",
    team: "Security & Compliance",
    impactScore: "High",
    evidenceState: "confirmed",
    context:
      "SOC-2 Type II audit identified risk of customer-identifiable credentials or sensitive communications being ingested verbatim from unmonitored Slack channels into semantic search indices.",
    drivers: [
      "SOC-2 Type II certification requirements",
      "GDPR Right-to-be-Forgotten data minimisation",
      "Prevention of prompt injection exfiltration",
    ],
    optionsConsidered: [
      {
        title: "Client-side Regex scrubbing",
        pros: ["Lightweight execution"],
        cons: ["High false-negative rate, lacks context-aware named entity recognition"],
        chosen: false,
      },
      {
        title: "Presidio NER Sanitization Gateway",
        pros: ["Context-aware transformer NLP models", "Custom regex pattern support", "Auditable logging"],
        cons: ["Adds 3-5ms processing overhead per document batch"],
        chosen: true,
      },
    ],
    consequences: [
      "Zero PII leaks recorded in subsequent audit runs",
      "Ingestion worker latency increased by 4ms on average, within acceptable budget",
    ],
    relatedNodes: ["person-marcus", "project-synapse"],
    citations: [MOCK_CITATIONS[1]],
  },
  {
    id: "dec-103",
    code: "ADR-044",
    title: "Server-Sent Events (SSE) Protocol for Streaming AI Assistant Syntheses",
    summary:
      "Standardize on Server-Sent Events over WebSockets for one-way streaming token generation and evidence citation telemetry in the Cerevia UI.",
    status: "accepted",
    date: "2026-09-20",
    owner: "Sarah Lin",
    team: "Knowledge AI",
    impactScore: "Medium",
    evidenceState: "confirmed",
    context:
      "User interface requires real-time incremental token rendering and citation chips as citations are resolved by FalkorDB graph verification.",
    drivers: [
      "HTTP/2 multiplexing compatibility",
      "Native browser EventSource reconnect semantics",
      "Zero bidirectional socket overhead",
    ],
    optionsConsidered: [
      {
        title: "Full-duplex WebSockets",
        pros: ["Bidirectional capability"],
        cons: ["Requires complex connection pool state across ingress proxies"],
        chosen: false,
      },
      {
        title: "Server-Sent Events (SSE)",
        pros: ["Simple HTTP stream", "Automatic reconnect", "Clean CDN and proxy pass-through"],
        cons: ["Unidirectional only (prompt submission uses regular POST)"],
        chosen: true,
      },
    ],
    consequences: [
      "Simplified proxy routing configuration in cloud ingress",
      "Immediate citation resolution telemetry streamable alongside markdown text chunks",
    ],
    relatedNodes: ["team-platform", "project-synapse"],
    citations: [MOCK_CITATIONS[2]],
  },
];
