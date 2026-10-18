/**
 * Parsing of inline citation markers in assistant answers.
 *
 * The model writes markers like `[1]` or `[1, 2]` into its prose. Splitting
 * them out is what lets the UI render chips without ever treating the answer
 * text as markup.
 */

const MARKER = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

export type AnswerPart =
  | { kind: "text"; value: string }
  | { kind: "marker"; value: string; indexes: number[] };

export function splitOnCitationMarkers(text: string): AnswerPart[] {
  const parts: AnswerPart[] = [];
  let cursor = 0;

  for (const match of text.matchAll(MARKER)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push({ kind: "text", value: text.slice(cursor, start) });
    parts.push({
      kind: "marker",
      value: match[0],
      indexes: match[1].split(",").map((value) => Number(value.trim())),
    });
    cursor = start + match[0].length;
  }

  if (cursor < text.length) parts.push({ kind: "text", value: text.slice(cursor) });
  return parts;
}
