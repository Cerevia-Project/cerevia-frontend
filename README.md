# Cerevia Frontend

> Enterprise AI Knowledge & Intelligence Workspace powered by FalkorDB

Cerevia helps organizations understand their internal knowledge by connecting documents, people, teams, projects, decisions, and multi-hop relationships through an AI reasoning assistant and an organizational knowledge graph backend.

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+ (tested with Node v26)
* npm 9+

### 1. Installation

```bash
git clone https://github.com/HabibAdavize/cerevia-frontend.git
cd cerevia-frontend
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 3. Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the Overview dashboard.

---

## 🎨 Design System Showcase

A dedicated showcase route is available at:

```
http://localhost:3000/design-system
```

The showcase demonstrates:
* **Centralized Design Tokens**: Light & Dark mode colors, typography hierarchy, monospace identifiers, spacing, and border radii.
* **Evidence System**: All five states (`confirmed`, `inferred`, `hypothesis`, `conflicting`, `missing`) with distinct icons, borders, and tooltips.
* **Interactive Citations & Source Drawer**: `CitationChip` and `SourcePreview` with mock ingested documents and highlighted excerpts.
* **Graph Entity Badges**: Person, Team, Project, Decision, and Document.
* **25 Reusable UI Primitives**: Buttons, inputs with validation, dialogs, drawers (sheets), tabs, tooltips, popovers, dropdowns, tables, and feedback states (`EmptyState`, `ErrorState`, `LoadingState`).

See the complete [Design System Guide](docs/DESIGN_SYSTEM.md) for usage patterns and API examples.

---

## 🛠️ Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Start development server with Turbopack |
| `npm run build` | `next build` | Create optimized production bundle |
| `npm run start` | `next start` | Run production build |
| `npm run lint` | `eslint .` | Run ESLint checks |
| `npm run type-check` | `tsc --noEmit` | Run strict TypeScript compiler verification |

---

## 📁 Project Structure

```
cerevia-frontend/
├── docs/
│   └── DESIGN_SYSTEM.md         # Component conventions & token documentation
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with ThemeProvider, AppShell & Toaster
│   │   ├── globals.css          # CSS custom properties & design tokens
│   │   ├── page.tsx             # Overview Dashboard
│   │   ├── design-system/       # Interactive Design System Showcase
│   │   ├── assistant/           # AI Assistant Conversation Workspace
│   │   ├── graph/               # FalkorDB Knowledge Graph Explorer
│   │   ├── projects/            # Projects & Risks Workspace
│   │   ├── decisions/           # Decisions & Evidence Tracing
│   │   ├── people/              # People & Teams
│   │   ├── sources/             # Document Ingestion & Connectors
│   │   ├── actions/             # Actions & Approvals
│   │   └── admin/               # Administration & Permissions
│   ├── components/
│   │   ├── ui/                  # 25 Reusable UI Primitives
│   │   ├── evidence/            # EvidenceBadge, CitationChip, EvidencePanel, SourcePreview
│   │   ├── entities/            # EntityBadge (Person, Team, Project, Decision, Document)
│   │   ├── layout/              # AppShell, Sidebar, Header, Breadcrumbs, CommandSearch
│   │   ├── theme-provider.tsx   # NextThemes provider wrapper
│   │   └── theme-toggle.tsx     # Light/Dark/System theme switcher
│   ├── config/
│   │   ├── navigation.ts        # Centralized navigation structure & metrics
│   │   └── tokens.ts            # Token metadata & dictionaries
│   ├── lib/
│   │   └── utils.ts             # cn() utility & formatting helpers
│   └── types/
│       └── index.ts             # Core TypeScript contracts (Evidence, Entities, etc.)
├── .env.example                 # Environment configuration template
├── package.json
└── tsconfig.json
```

---

## 🤝 Collaboration Guidelines

* **Import Path Alias**: Use `@/*` (e.g. `import { Button } from "@/components/ui"`).
* **Styling**: Consume tokens defined in `globals.css` (e.g., `bg-card`, `text-primary`, `border-border`). Avoid hardcoding arbitrary hex colors.
* **Evidence Transparency**: Every AI assertion must be paired with an `EvidenceBadge` and a supporting `CitationChip` or `EvidencePanel`.
* **Zero Backend Dependency for UI**: Components are decoupled from live APIs so engineers can build UI workflows with mock data contracts before connecting backend services.
