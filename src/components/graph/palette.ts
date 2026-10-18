export interface GraphColor {
  base: string;
  label: string;
}

const LIGHT: Record<string, GraphColor> = {
  employee: { base: "#3A8275", label: "#1f4f46" },
  team: { base: "#6B5B95", label: "#453a60" },
  department: { base: "#7D6CA8", label: "#4a3f68" },
  project: { base: "#4A7298", label: "#2d4760" },
  milestone: { base: "#3E7CA8", label: "#264d68" },
  task: { base: "#3F8FA0", label: "#265965" },
  issue: { base: "#B4652A", label: "#703f1a" },
  document: { base: "#944E63", label: "#5d313e" },
  meeting: { base: "#5B6BA8", label: "#394268" },
  decision: { base: "#946E24", label: "#5d4516" },
  customer: { base: "#2F8A5B", label: "#1d5639" },
  ticket: { base: "#A86B2A", label: "#68421a" },
  policy: { base: "#5C6672", label: "#3a4049" },
  system: { base: "#6E7480", label: "#444950" },
  action_item: { base: "#73903A", label: "#485a24" },
};

const DARK: Record<string, GraphColor> = {
  employee: { base: "#5FB3A1", label: "#9fd6c9" },
  team: { base: "#9B8BC4", label: "#c4b9e0" },
  department: { base: "#A897D2", label: "#cdc2e6" },
  project: { base: "#71A3CE", label: "#aacbe5" },
  milestone: { base: "#64A9D6", label: "#a3cde9" },
  task: { base: "#5FB6CA", label: "#a1d6e1" },
  issue: { base: "#DE9256", label: "#eebb94" },
  document: { base: "#C97E93", label: "#e1aebd" },
  meeting: { base: "#8694D6", label: "#b4bde7" },
  decision: { base: "#C79B4A", label: "#e0c08b" },
  customer: { base: "#56B883", label: "#97d7b4" },
  ticket: { base: "#D6974F", label: "#e8bf8e" },
  policy: { base: "#93A0AE", label: "#bfc8d1" },
  system: { base: "#A2A9B6", label: "#cacfd7" },
  action_item: { base: "#A2BE68", label: "#c6d79e" },
};

const FALLBACK_LIGHT: GraphColor[] = [
  { base: "#4A7298", label: "#2d4760" },
  { base: "#3A8275", label: "#1f4f46" },
  { base: "#946E24", label: "#5d4516" },
  { base: "#944E63", label: "#5d313e" },
  { base: "#6B5B95", label: "#453a60" },
];

const FALLBACK_DARK: GraphColor[] = [
  { base: "#71A3CE", label: "#aacbe5" },
  { base: "#5FB3A1", label: "#9fd6c9" },
  { base: "#C79B4A", label: "#e0c08b" },
  { base: "#C97E93", label: "#e1aebd" },
  { base: "#9B8BC4", label: "#c4b9e0" },
];

// Unknown colour keys get a deterministic slot, so new entity types render consistently.
function slotFor(key: string, slots: number): number {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 100_000;
  }
  return hash % slots;
}

export function graphColor(colorKey: string, isDark: boolean): GraphColor {
  const palette = isDark ? DARK : LIGHT;
  const known = palette[colorKey];
  if (known) return known;

  const fallbacks = isDark ? FALLBACK_DARK : FALLBACK_LIGHT;
  return fallbacks[slotFor(colorKey, fallbacks.length)];
}

export function graphChrome(isDark: boolean) {
  return {
    edge: isDark ? "#4b5059" : "#c8ccd2",
    edgeLabel: isDark ? "#9aa1ab" : "#6b7280",
    historicalEdge: isDark ? "#3c4049" : "#dfe2e6",
    selection: isDark ? "#e6e8ea" : "#1f2328",
    highlight: isDark ? "#E0B64A" : "#946E24",
  };
}
