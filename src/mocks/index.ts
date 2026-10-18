/**
 * Contract fixtures.
 *
 * These JSON files are copied from `packages/contracts/fixtures` in the
 * backend repository by `npm run contracts:sync`. They are the same payloads
 * the contract mock server returns, so the design-system showcase and tests
 * exercise exactly the shapes the API produces. They are never used by the
 * application itself - every screen reads the API.
 */

import accessLimited from "./fixtures/answer.access-limited.json";
import insufficientEvidence from "./fixtures/answer.insufficient-evidence.json";
import launchDelay from "./fixtures/answer.launch-delay.json";
import aiUnavailable from "./fixtures/error.ai-unavailable.json";
import forbidden from "./fixtures/error.forbidden.json";
import launchNeighborhood from "./fixtures/graph.launch-neighborhood.json";
import ingestionFailed from "./fixtures/ingestion.failed.json";
import ingestionInProgress from "./fixtures/ingestion.in-progress.json";

import type { AssistantMessage, IngestionJob, Subgraph } from "@/api/types";
import type { ProblemDetails } from "@/api/errors";

export const FIXTURES = {
  answers: {
    launchDelay: launchDelay as unknown as AssistantMessage,
    insufficientEvidence: insufficientEvidence as unknown as AssistantMessage,
    accessLimited: accessLimited as unknown as AssistantMessage,
  },
  graph: {
    launchNeighborhood: launchNeighborhood as unknown as Subgraph,
  },
  ingestion: {
    inProgress: ingestionInProgress as unknown as IngestionJob,
    failed: ingestionFailed as unknown as IngestionJob,
  },
  errors: {
    aiUnavailable: aiUnavailable as unknown as ProblemDetails,
    forbidden: forbidden as unknown as ProblemDetails,
  },
} as const;
