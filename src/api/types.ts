/**
 * Contract-derived types.
 *
 * Everything here is an alias into `schema.d.ts`, which is generated from
 * `contracts/openapi.yaml`. Nothing in this file is hand-written structure:
 * if the contract drops or retypes a field, the aliases break at compile time.
 */

import type { components, paths } from "@/api/schema";

type Schemas = components["schemas"];

/** JSON body of the success response (200, then 201, then 202) of an operation. */
type JsonBody<Operation> = Operation extends { responses: infer R }
  ? R extends { 200: { content: { "application/json": infer B } } }
    ? B
    : R extends { 201: { content: { "application/json": infer B } } }
      ? B
      : R extends { 202: { content: { "application/json": infer B } } }
        ? B
        : never
  : never;

/** Success body of `GET <Path>`. */
type GetResult<Path extends keyof paths> = paths[Path] extends { get: infer O }
  ? JsonBody<O>
  : never;

/** Success body of `POST <Path>`. */
type PostResult<Path extends keyof paths> = paths[Path] extends { post: infer O }
  ? JsonBody<O>
  : never;

/** JSON request body of `POST <Path>`. */
type PostBody<Path extends keyof paths> = paths[Path] extends {
  post: { requestBody?: { content: { "application/json": infer B } } };
}
  ? B
  : never;

/* ── Core domain objects ───────────────────────────────────────────────── */

export type EntityRef = Schemas["EntityRef"];
export type EntityType = Schemas["EntityType"];
export type ExtractionMethod = Schemas["ExtractionMethod"];
export type Provenance = Schemas["Provenance"];
export type Citation = Schemas["Citation"];
export type GraphNode = Schemas["GraphNode"];
export type GraphEdge = Schemas["GraphEdge"];
export type Subgraph = Schemas["Subgraph"];
export type EvidenceKind = Schemas["EvidenceKind"];
export type Claim = Schemas["Claim"];
export type GraphPath = Schemas["GraphPath"];
export type Conflict = Schemas["Conflict"];
export type ConflictSide = Conflict["sides"][number];
export type ConflictStatus = Conflict["status"];
export type Session = Schemas["Session"];
export type User = Schemas["User"];
export type Role = Schemas["Role"];
export type Conversation = Schemas["Conversation"];
export type Message = Schemas["Message"];
export type AnswerStatus = Schemas["AnswerStatus"];
export type AssistantMessage = Schemas["AssistantMessage"];
export type StreamEvent = Schemas["StreamEvent"];
export type StreamEventType = NonNullable<StreamEvent["type"]>;
export type StreamStage = NonNullable<StreamEvent["stage"]>;
export type SuggestedAction = NonNullable<StreamEvent["actions"]>[number];
export type IngestionEvent = Schemas["IngestionEvent"];
export type Source = Schemas["Source"];
export type SourceState = Source["state"];
export type Document = Schemas["Document"];
export type DocumentVersion = Document["versions"][number];
export type IngestionJob = Schemas["IngestionJob"];
export type IngestionStatus = IngestionJob["status"];
export type ProjectSummary = Schemas["ProjectSummary"];
export type ProjectDetail = Schemas["ProjectDetail"];
export type RiskLevel = ProjectSummary["riskLevel"];
export type Risk = Schemas["Risk"];
export type DecisionSummary = Schemas["DecisionSummary"];
export type DecisionDetail = Schemas["DecisionDetail"];
export type PersonProfile = Schemas["PersonProfile"];
export type Expertise = PersonProfile["expertise"][number];
export type ActionProposal = Schemas["ActionProposal"];
export type ProposalStatus = ActionProposal["status"];
export type AuditRecord = Schemas["AuditRecord"];

/* ── Response envelopes ────────────────────────────────────────────────── */

/** Cursor-paginated list, as every `items`/`nextCursor` endpoint returns it. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PageParams {
  limit?: number;
  cursor?: string;
}

export type Overview = GetResult<"/api/v1/overview">;
export type GraphSchema = GetResult<"/api/v1/graph/schema">;
export type EntityTypeMeta = GraphSchema["entityTypes"][number];
export type EdgeTypeMeta = GraphSchema["edgeTypes"][number];
export type GraphEntity = GetResult<"/api/v1/graph/entities/{id}">;
export type GraphPathsResult = GetResult<"/api/v1/graph/paths">;
export type EntityHistory = GetResult<"/api/v1/graph/entities/{id}/history">;
export type ConversationDetail = GetResult<"/api/v1/conversations/{id}">;
export type SendMessageResult = PostResult<"/api/v1/conversations/{id}/messages">;
export type EvidenceBundle = GetResult<"/api/v1/messages/{messageId}/evidence">;
export type LaunchReadiness = GetResult<"/api/v1/projects/{id}/launch-readiness">;
export type ReadinessVerdict = LaunchReadiness["verdict"];
export type DecisionTrace = GetResult<"/api/v1/decisions/{id}/trace">;
export type DecisionValidity = DecisionTrace["validity"];
export type TeamDetail = GetResult<"/api/v1/teams/{id}">;
export type ExpertiseMatches = GetResult<"/api/v1/expertise/search">;
export type ExpertiseMatch = ExpertiseMatches["items"][number];
export type DocumentContent = GetResult<"/api/v1/documents/{id}/content">;
export type UploadResult = PostResult<"/api/v1/sources/{id}/uploads">;
export type RetryJobResult = PostResult<"/api/v1/ingestion/jobs/{id}/retry">;
export type DemoLoadResult = PostResult<"/api/v1/demo/load">;
export type Connector = GetResult<"/api/v1/connectors">["items"][number];
export type ConnectorState = Connector["state"];
export type CreateProposalResult = PostResult<"/api/v1/actions/proposals">;
export type ProposalKind = PostBody<"/api/v1/actions/proposals">["kind"];
export type SourceAcl = GetResult<"/api/v1/admin/sources/{id}/access">;
export type AclGrant = SourceAcl["grants"][number];
export type Organization = GetResult<"/api/v1/admin/organization">;
export type RetrievalTrace = GetResult<"/api/v1/messages/{id}/trace">;

/* ── Request shapes ────────────────────────────────────────────────────── */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface NeighborsParams {
  edgeTypes?: string[];
  direction?: "in" | "out" | "both";
  depth?: number;
  limit?: number;
}

export interface DecisionListParams extends PageParams {
  status?: string;
  projectId?: string;
  q?: string;
}

export interface ConflictListParams extends PageParams {
  status?: string;
  entityId?: string;
}

export interface AuditListParams extends PageParams {
  actor?: string;
  action?: string;
  from?: string;
  to?: string;
}
