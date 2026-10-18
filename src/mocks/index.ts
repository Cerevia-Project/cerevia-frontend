/** Contract fixtures (synced by `npm run contracts:sync`) for the showcase and tests. */
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
