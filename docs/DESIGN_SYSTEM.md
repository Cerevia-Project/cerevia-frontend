# Cerevia Design System & Component Foundation Guide

Welcome to the **Cerevia Design System**. This guide provides architecture patterns, component conventions, token references, and best practices for engineers and designers building features for the Cerevia intelligence platform.

---

## 1. Design Principles

1. **Calm Business-Intelligence Aesthetic**: A serious enterprise tool used by engineers, analysts, and leadership. Avoid decorative fluff, neon glows, or arbitrary gradients.
2. **Restrained Palette**: Neutral slate and zinc surfaces anchored by a confident blue-indigo primary accent (`hsl(226 70% 50%)`).
3. **Evidence Transparency**: Every AI assertion, graph inference, or decision claim must be visibly attributable to source records with clear confidence levels.
4. **Accessible by Default**: Keyboard navigable, visible focus rings (`ring-2 ring-ring ring-offset-2`), semantic HTML, high-contrast labels, and screen reader labels.
5. **Light and Dark Harmony**: Automatic system detection with persisted manual toggle. All tokens adapt automatically via CSS custom properties.

---

## 2. Centralized Design Tokens

All tokens are declared in `src/app/globals.css` using CSS custom properties and mapped to Tailwind utilities:

### 2.1 Core Palette

| Token Variable | Description | Light HSL | Dark HSL |
| :--- | :--- | :--- | :--- |
| `--background` | Page canvas background | `220 14% 97%` | `224 25% 7%` |
| `--foreground` | Main high-contrast text | `224 71% 4%` | `210 20% 98%` |
| `--card` | Card & surface container | `0 0% 100%` | `224 24% 10%` |
| `--primary` | Restrained blue-indigo brand | `226 70% 50%` | `226 75% 62%` |
| `--secondary` | Quiet surface elements | `220 14% 92%` | `224 20% 15%` |
| `--muted` | Subtle backgrounds | `220 14% 93%` | `224 20% 14%` |
| `--border` | Dividers & panel boundaries | `220 13% 88%` | `224 20% 18%` |
| `--ring` | Focus ring indicator | `226 70% 50%` | `226 75% 62%` |

### 2.2 Semantic Status Colors

* `--success`: Emerald (`hsl(152 64% 38%)` light / `hsl(152 62% 48%)` dark)
* `--warning`: Amber bronze (`hsl(38 92% 44%)` light / `hsl(38 92% 54%)` dark)
* `--info`: Cyan azure (`hsl(199 89% 46%)` light / `hsl(199 89% 56%)` dark)
* `--destructive`: Crimson red (`hsl(0 84% 56%)` light / `hsl(0 72% 54%)` dark)

---

## 3. Evidence & Knowledge System

Cerevia is built around distinguishing the strength and origin of intelligence claims:

### 3.1 The Five Evidence States

Never rely on color alone. Each state pairs a distinctive icon, label, and border style:

1. **`confirmed`** (Solid green border, `ShieldCheck` icon): Verified against primary documents or official ADRs.
2. **`inferred`** (Solid blue border, `GitMerge` icon): Derived through multi-hop relational synthesis in FalkorDB.
3. **`hypothesis`** (Dashed purple border, `Sparkles` icon, `[UNVERIFIED]` tag): Plausible theory or extrapolation. Must never be presented as confirmed fact.
4. **`conflicting`** (Solid amber border, `AlertTriangle` icon): Opposing statements detected across two or more records.
5. **`missing`** (Dotted slate border, `CircleHelp` icon): No evidentiary nodes located in the graph.

### 3.2 Evidence Components

```tsx
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CitationChip } from "@/components/evidence/CitationChip";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { SourcePreview } from "@/components/evidence/SourcePreview";

// 1. Evidence Badge
<EvidenceBadge state="confirmed" size="default" />

// 2. Citation Chip
<CitationChip
  citation={{
    id: "cit-1",
    code: "ADR-104",
    label: "FalkorDB Sub-millisecond latency results",
    documentTitle: "Architecture Decision: Graph Store Selection",
    sourceType: "confluence",
  }}
/>

// 3. Evidence Panel
<EvidencePanel claim={claimObject} collapsible />
```

---

## 4. Reusable UI Primitives (`@/components/ui`)

All primitives are accessible, typed with strict TypeScript, and exported from `@/components/ui`:

| Component | Key Props & Features |
| :--- | :--- |
| `Button` | Variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`, `success`. `isLoading`, `leftIcon`, `rightIcon`. |
| `IconButton` | Dedicated icon button requiring `aria-label` for screen readers. |
| `Input` | Integrates `label`, `description`, `error`, `leftIcon`, and `rightIcon`. |
| `Textarea` | Multiline input with `label`, `description`, and `error` states. |
| `Select` | Radix Select with scroll controls, grouping, and check indicators. |
| `Checkbox` | Radix Checkbox with custom stroke checkmark. |
| `Switch` | Radix Switch with animated sliding thumb. |
| `Badge` | Variants: `default`, `secondary`, `outline`, `success`, `warning`, `info`, `destructive`, `muted`. |
| `Card` | `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `hoverable`. |
| `Tabs` | `TabsList`, `TabsTrigger`, `TabsContent`. |
| `Tooltip` | `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`. |
| `Popover` | Floating popover with focus management. |
| `Dialog` | Accessible modal dialog with overlay, close trigger, header, footer. |
| `Sheet` | Side drawer supporting `side="left"` (mobile nav) and `side="right"` (inspector). |
| `DropdownMenu` | Menu with items, labels, separators, and destructive items. |
| `Table` | Accessible data grid (`TableHeader`, `TableBody`, `TableRow`, `TableCell`). |
| `Breadcrumbs` | Hierarchy trail with home icon and active route detection. |
| `EmptyState` | Empty state with icon, title, description, and action button. |
| `ErrorState` | Error card with error code and retry action button. |
| `LoadingState` | Spinner or skeleton placeholder modes. |
| `Sonner` | Toast system via `toast()` from `sonner`. |

---

## 5. How to Add a New Component

1. **Locate or Create**:
   - Primitives go in `src/components/ui/<component-name>.tsx`
   - Feature/domain components go in `src/components/<feature>/`
2. **Follow Component Rules**:
   - Use `React.forwardRef` where DOM references are needed.
   - Accept `className` and merge via `cn(...)` from `@/lib/utils`.
   - Consume CSS variables from `globals.css` rather than hardcoding colors.
   - Include proper ARIA attributes and keyboard listeners.
3. **Export Cleanly**:
   - Add the component to the corresponding barrel export (`src/components/ui/index.ts`).
4. **Add to Showcase**:
   - Add an interactive example to `src/app/design-system/page.tsx`.

---

## 6. How to Preview the Design System

Run the development server and navigate to:
```
http://localhost:3000/design-system
```
This route demonstrates all tokens, buttons, inputs, dialogs, drawers, evidence badges, citations, and feedback states with live interactivity.
