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
