/**
 * Centralized API schemas and types for Cerevia
 */

import { EvidenceState, EntityType, Citation } from "@/types";

export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface GraphNodeDto {
  id: string;
  label: string;
  type: EntityType;
  properties: Record<string, unknown>;
  confidence?: number;
}

export interface GraphRelationshipDto {
  id: string;
  source: string;
  target: string;
  type: string;
  evidenceState: EvidenceState;
  citations: Citation[];
}

export interface GraphDataDto {
  nodes: GraphNodeDto[];
  edges: GraphRelationshipDto[];
}
