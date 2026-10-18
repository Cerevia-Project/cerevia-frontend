import { describe, expect, it } from "vitest";
import { formatPercent, formatVersion, humanize } from "@/lib/formatters";

describe("formatVersion", () => {
  it("prefixes numeric versions", () => {
    expect(formatVersion("3")).toBe("v3");
  });

  it("leaves non-numeric versions alone", () => {
    expect(formatVersion("unknown")).toBe("unknown");
  });

  it("renders nothing for a missing version", () => {
    expect(formatVersion(undefined)).toBe("");
  });
});

describe("humanize", () => {
  it("turns enum values into sentence case", () => {
    expect(humanize("needs_review")).toBe("Needs review");
  });
});

describe("formatPercent", () => {
  it("formats 0-1 ratios", () => {
    expect(formatPercent(0.55)).toBe("55%");
  });
});
