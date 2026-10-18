/**
 * Display formatting. All dates and numbers go through `Intl`, so switching
 * locale later is a change in one place.
 */

const LOCALE = "en-US";

export function formatDate(
  input: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
): string {
  if (input === null || input === undefined) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(LOCALE, options).format(date);
}

export function formatDateTime(input: string | number | Date | null | undefined): string {
  return formatDate(input, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(input: string | number | Date | null | undefined): string {
  if (input === null || input === undefined) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "-";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  const formatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
  for (const [unit, secondsPerUnit] of units) {
    if (Math.abs(seconds) >= secondsPerUnit) {
      return formatter.format(Math.round(seconds / secondsPerUnit), unit);
    }
  }
  return formatter.format(seconds, "second");
}

export function formatNumber(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(LOCALE).format(value);
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(LOCALE, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Confidence and progress arrive as 0–1 ratios. */
export function formatPercent(ratio: number | null | undefined, digits = 0): string {
  if (typeof ratio !== "number" || Number.isNaN(ratio)) return "-";
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    maximumFractionDigits: digits,
  }).format(ratio);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

/** `needs_review` → `Needs review`, for enum values with no label in the API. */
export function humanize(value: string | null | undefined): string {
  if (!value) return "-";
  const spaced = value.replace(/[_-]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function truncate(value: string, length: number): string {
  if (!value || value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}
