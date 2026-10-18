/**
 * TanStack Query cache keys.
 *
 * One place, so invalidation after a mutation never has to guess the shape of
 * a key written somewhere else.
 */

import type {
  AuditListParams,
  ConflictListParams,
  DecisionListParams,
  NeighborsParams,
  PageParams,
} from "@/api/types";

export const queryKeys = {
  session: ["session"] as const,
  overview: ["overview"] as const,

  conversations: {
    all: ["conversations"] as const,
    list: (params: PageParams = {}) => ["conversations", "list", params] as const,
    detail: (id: string) => ["conversations", "detail", id] as const,
    message: (conversationId: string, messageId: string) =>
      ["conversations", conversationId, "messages", messageId] as const,
    evidence: (messageId: string) => ["messages", messageId, "evidence"] as const,
    trace: (messageId: string) => ["messages", messageId, "trace"] as const,
  },

  graph: {
    all: ["graph"] as const,
    schema: ["graph", "schema"] as const,
    search: (q: string, types?: string[]) => ["graph", "search", q, types ?? null] as const,
    entity: (id: string) => ["graph", "entity", id] as const,
    neighbors: (id: string, params: NeighborsParams = {}) =>
      ["graph", "neighbors", id, params] as const,
    paths: (from: string, to: string, maxHops?: number) =>
      ["graph", "paths", from, to, maxHops ?? null] as const,
    edge: (id: string) => ["graph", "edge", id] as const,
    history: (id: string) => ["graph", "history", id] as const,
  },

  projects: {
    all: ["projects"] as const,
    list: (params: PageParams = {}) => ["projects", "list", params] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
    tasks: (id: string) => ["projects", id, "tasks"] as const,
    dependencies: (id: string) => ["projects", id, "dependencies"] as const,
    risks: (id: string) => ["projects", id, "risks"] as const,
    readiness: (id: string) => ["projects", id, "launch-readiness"] as const,
  },

  risks: (window?: string) => ["risks", window ?? null] as const,

  decisions: {
    all: ["decisions"] as const,
    list: (params: DecisionListParams = {}) => ["decisions", "list", params] as const,
    detail: (id: string) => ["decisions", "detail", id] as const,
    revisions: (id: string) => ["decisions", id, "revisions"] as const,
    trace: (id: string) => ["decisions", id, "trace"] as const,
  },

  people: {
    all: ["people"] as const,
    list: (params: PageParams = {}) => ["people", "list", params] as const,
    detail: (id: string) => ["people", "detail", id] as const,
    expertise: (topic: string) => ["people", "expertise", topic] as const,
  },

  teams: {
    all: ["teams"] as const,
    list: (params: PageParams = {}) => ["teams", "list", params] as const,
    detail: (id: string) => ["teams", "detail", id] as const,
  },

  conflicts: {
    all: ["conflicts"] as const,
    list: (params: ConflictListParams = {}) => ["conflicts", "list", params] as const,
    detail: (id: string) => ["conflicts", "detail", id] as const,
  },

  sources: {
    all: ["sources"] as const,
    list: (params: PageParams = {}) => ["sources", "list", params] as const,
    access: (id: string) => ["sources", id, "access"] as const,
  },

  connectors: ["connectors"] as const,

  documents: {
    all: ["documents"] as const,
    list: (params: PageParams = {}) => ["documents", "list", params] as const,
    detail: (id: string) => ["documents", "detail", id] as const,
    content: (id: string, chunk?: string) => ["documents", id, "content", chunk ?? null] as const,
  },

  ingestion: {
    all: ["ingestion"] as const,
    list: (params: PageParams = {}) => ["ingestion", "list", params] as const,
    detail: (id: string) => ["ingestion", "detail", id] as const,
  },

  proposals: {
    all: ["proposals"] as const,
    list: (params: PageParams = {}) => ["proposals", "list", params] as const,
    detail: (id: string) => ["proposals", "detail", id] as const,
  },

  admin: {
    users: ["admin", "users"] as const,
    roles: ["admin", "roles"] as const,
    permissions: ["admin", "permissions"] as const,
    organization: ["admin", "organization"] as const,
    audit: (params: AuditListParams = {}) => ["admin", "audit", params] as const,
  },

  audit: (params: AuditListParams = {}) => ["audit", params] as const,
} as const;
