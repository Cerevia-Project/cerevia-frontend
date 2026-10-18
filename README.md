# Cerevia Frontend

Enterprise AI knowledge and intelligence workspace: documents, people, teams, projects, decisions and the relationships between them, with an assistant that cites its evidence.

---

## The one rule

The frontend depends on exactly one artifact: **the API contract** (`contracts/openapi.yaml`) and its fixtures.
It never imports backend code, never talks to a database or an LLM, and switches between a mock and the real API through a single environment variable.

Everything else follows from that:

* `src/api/schema.d.ts` is **generated** from the contract. It is never edited by hand.
* Every request goes through `src/api/client.ts`. No component calls `fetch` directly.
* `NEXT_PUBLIC_API_BASE_URL` selects the API. No code branches on "mock versus real".
* Unknown enum values render with a safe fallback rather than crashing.

---

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Pointing at an API

| Target | `NEXT_PUBLIC_API_BASE_URL` |
| :--- | :--- |
| Local backend | `http://localhost:3001` |
| Contract mock (Prism) | `http://localhost:4010` |

The value is the API **origin**, without the `/api/v1` prefix: endpoint paths carry it, and so does the `streamUrl` the server returns for assistant answers.

To run the contract mock:

```bash
npx @stoplight/prism-cli mock contracts/openapi.yaml -p 4010
```

### Keeping the contract in sync

```bash
npm run contracts:sync       # copy openapi.yaml + fixtures from the backend repo
npm run contracts:generate   # regenerate src/api/schema.d.ts
npm run contracts:check      # fails if the generated client is out of date (CI)
```

`contracts:sync` reads `CEREVIA_CONTRACT_DIR`, defaulting to `../cerevia-backend/packages/contracts`.

---

## Scripts

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) |
| `npm run contracts:sync` | Copy the contract and fixtures from the backend |
| `npm run contracts:generate` | Regenerate the typed client |
| `npm run contracts:check` | Fail if the generated client has drifted |
| `npm run e2e` | Playwright end-to-end tests against a live API |

---

## Architecture

```
src/
  api/                     # the only place that talks to the network
    schema.d.ts            #   generated from contracts/openapi.yaml - do not edit
    types.ts               #   aliases into the generated schema
    client.ts              #   fetch wrapper: base URL, session cookie, CSRF, errors
    errors.ts              #   problem details -> ApiError -> UI copy
    sse.ts                 #   SSE over fetch + ReadableStream, with reconnect
    query-keys.ts          #   one place for every cache key
    endpoints/             #   one typed module per contract tag
  providers/               # query client, session, route guard
  features/                # one folder per domain: api.ts (hooks) + views
  components/
    ui/                    # design-system primitives
    evidence/              # EvidenceBadge, CitationChip, EvidencePanel, SourcePreview
    entities/              # EntityBadge
    graph/                 # GraphCanvas (Cytoscape adapter), controls, inspectors
    feedback/              # QueryBoundary, EmptyState, ErrorState, InsufficientEvidence…
    layout/                # shell, sidebar, header, command palette
  lib/                     # formatting, routing helpers, flags
  mocks/fixtures/          # contract fixtures, for the showcase and tests
```

### Data flow

Server state lives in TanStack Query. A screen never assembles a request itself:

```
view  ->  features/<domain>/api.ts  ->  api/endpoints/<tag>.ts  ->  api/client.ts
```

`QueryBoundary` renders the four states every API-backed view has - loading, failed, forbidden or not-found, and loaded - so no screen invents its own error handling.

### Session and permissions

* `POST /auth/login` sets an httpOnly `sid` cookie; `GET /auth/session` bootstraps the session.
* The CSRF token from the session is attached to every mutating request automatically.
* A 401 anywhere redirects to `/login?next=<path>`, preserving where the user was.
* `permissions[]` only **hides** what the server would refuse. The server remains the authority, and a direct URL still renders a clear access state.

### Streaming answers

`POST /conversations/{id}/messages` returns a message id and a stream URL rather than an answer.
`useAssistantStream` posts, opens the stream, and folds typed events into one view model: status chips, text deltas, claims, citations, paths, conflicts, follow-ups and suggested actions.
Text deltas are batched per animation frame. If the stream cannot be finished, the stored message is fetched instead, so a dropped connection never costs the user the answer.

### Evidence

Every assertion on screen carries its evidence kind (`confirmed`, `inferred`, `hypothesis`, `conflicting`, `missing`) as **colour plus icon plus text label** - never colour alone - and the citations behind it.
Document passages are untrusted content: they are rendered as text, never as markup, and never auto-linked.

### Graph

`GraphCanvas` is a Cytoscape adapter, lazy-loaded and confined to one file, so the library can be replaced without touching any screen.
The explorer always starts from one entity and expands outwards, with a hard client-side node cap.
Because a canvas cannot be read by a screen reader, every view has a synchronized list view with keyboard navigation.

---

## Conventions

* Import through the `@/*` alias.
* Consume design tokens (`bg-card`, `text-primary`, `border-border`); no arbitrary hex values.
* Dates and numbers go through `src/lib/formatters.ts`, which wraps `Intl`.
* Domain types come from `@/api/types`. Never hand-write a shape the contract already describes.

## End-to-end tests

```bash
npm run e2e          # Playwright, against a live API
npm run e2e:ui       # the same suite in Playwright's UI mode
```

The suite needs an API running. Playwright starts the frontend itself and reuses one that is already running.

```bash
# in the backend repo
docker-compose up -d
pnpm --filter api migrate && pnpm --filter api bootstrap
FRONTEND_ORIGIN=http://localhost:3000 pnpm --filter api dev
```

`FRONTEND_ORIGIN` must match the origin the tests use (`http://localhost:3000` by default), or the browser blocks every request as cross-origin. `E2E_EMAIL` and `E2E_PASSWORD` override the bootstrap credentials.

The suite covers the flows the plan calls out: the login redirect and its return path, rejected credentials, the command palette, a focused graph with its list view, asking a question, planned connectors staying non-interactive, conflicts, and an unprivileged user seeing no approval controls.

## Known gaps against the contract

These remain unimplemented on the backend. The UI calls them as specified and degrades to a clear state:

* `GET /api/v1/ingestion/jobs/{id}/events` - SSE progress. Polling the job is the supported baseline, and is what the UI uses.
* `GET /api/v1/messages/{id}/trace` - the development-only retrieval trace, behind a dev-build flag.
* `GET /api/v1/graph/paths` and `GET /api/v1/graph/entities/{id}/history` return empty stubs.
