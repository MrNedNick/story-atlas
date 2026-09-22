import { describe, expect, it } from "vitest";
import {
  isPublishable,
  parseIllustration,
  parseStory,
  sortChaptersByOrder,
} from "../../src/domain/01-content-schema";
import { invalidStoryInputs, validStoryInput } from "../fixtures/01-story-fixtures";

describe("parseStory", () => {
  it("accepts a well-formed story and coerces dates", () => {
    const result = parseStory(validStoryInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.slug).toBe("the-vanishing-glacier");
    expect(result.value.publishedAt).toBeInstanceOf(Date);
    expect(result.value.chapters).toHaveLength(1);
  });

  it("rejects a story with no chapters, with a distinguishable error", () => {
    const result = parseStory(invalidStoryInputs.missingChapters);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("invalid-story");
    expect(result.error.issues.join(" ")).toMatch(/chapter/i);
  });

  it("rejects a slug that isn't lowercase kebab-case", () => {
    const result = parseStory(invalidStoryInputs.badSlug);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("invalid-story");
    expect(result.error.issues.join(" ")).toMatch(/slug/i);
  });

  it("rejects a story whose illustration is missing alt text", () => {
    const result = parseStory(invalidStoryInputs.illustrationMissingAlt);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("invalid-story");
  });
});

describe("parseIllustration", () => {
  it("returns a distinguishable error kind for a bad illustration", () => {
    const result = parseIllustration({ id: "il-1", kind: "photo", src: "x.jpg", alt: "" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("invalid-illustration");
  });
});

describe("sortChaptersByOrder", () => {
  it("sorts without mutating the input array (no JS runtime required by callers)", () => {
    const parsed = parseStory(validStoryInput);
    if (!parsed.ok) throw new Error("fixture should be valid");
    const chapters = [
      { ...parsed.value.chapters[0], order: 2, id: "ch-2" },
      { ...parsed.value.chapters[0], order: 1, id: "ch-1" },
    ];
    const sorted = sortChaptersByOrder(chapters);
    expect(sorted.map((c) => c.id)).toEqual(["ch-1", "ch-2"]);
    expect(chapters.map((c) => c.id)).toEqual(["ch-2", "ch-1"]);
  });
});

describe("isPublishable", () => {
  it("is true once publishedAt has passed and there is at least one chapter", () => {
    const parsed = parseStory(validStoryInput);
    if (!parsed.ok) throw new Error("fixture should be valid");
    expect(isPublishable(parsed.value, new Date("2026-02-01"))).toBe(true);
  });

  it("is false before publishedAt, even with chapters present", () => {
    const parsed = parseStory(validStoryInput);
    if (!parsed.ok) throw new Error("fixture should be valid");
    expect(isPublishable(parsed.value, new Date("2025-01-01"))).toBe(false);
  });
});
