import { describe, expect, it } from "vitest";
import { splitOnCitationMarkers } from "@/lib/citations";

describe("splitOnCitationMarkers", () => {
  it("returns a single text part when there is no marker", () => {
    expect(splitOnCitationMarkers("No citations here.")).toEqual([
      { kind: "text", value: "No citations here." },
    ]);
  });

  it("splits a single marker out of the surrounding prose", () => {
    expect(splitOnCitationMarkers("The launch slipped [1] last week.")).toEqual([
      { kind: "text", value: "The launch slipped " },
      { kind: "marker", value: "[1]", indexes: [1] },
      { kind: "text", value: " last week." },
    ]);
  });

  it("reads every index out of a grouped marker", () => {
    const parts = splitOnCitationMarkers("Two sources agree [2, 3].");

    expect(parts[1]).toEqual({ kind: "marker", value: "[2, 3]", indexes: [2, 3] });
  });

  it("keeps several markers in order", () => {
    const parts = splitOnCitationMarkers("[1] then [2] then [3]");

    expect(parts.filter((part) => part.kind === "marker").map((part) => part.value)).toEqual([
      "[1]",
      "[2]",
      "[3]",
    ]);
  });

  it("leaves bracketed text that is not a marker alone", () => {
    expect(splitOnCitationMarkers("See [appendix] for detail.")).toEqual([
      { kind: "text", value: "See [appendix] for detail." },
    ]);
  });

  it("handles a marker at the very start and very end", () => {
    const parts = splitOnCitationMarkers("[1] middle [2]");

    expect(parts[0]).toEqual({ kind: "marker", value: "[1]", indexes: [1] });
    expect(parts[parts.length - 1]).toEqual({ kind: "marker", value: "[2]", indexes: [2] });
  });

  it("returns nothing for an empty answer", () => {
    expect(splitOnCitationMarkers("")).toEqual([]);
  });
});
