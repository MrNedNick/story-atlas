import { describe, expect, it } from "vitest";
import { collectSources, relatedStories } from "../../src/domain/05-sources";
import { aral, chapters, stories } from "../fixtures/05-sources-fixtures";

const now = new Date("2026-09-27T12:00:00Z");

describe("story source list", () => {
  it("lists each work once, numbered by first citation, with every chapter that cites it", () => {
    const result = collectSources(chapters);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((entry) => [entry.number, entry.source, entry.citedIn.map((ref) => ref.chapterId)])).toEqual([
      // Same URL apart from the fragment and a trailing slash: one work, cited in chapters 1 and 2.
      [1, "FAO AQUASTAT", ["01-sea", "02-rivers"]],
      // No URL: matched by source name, whatever the case or spacing.
      [2, "Micklin (2007)", ["02-rivers", "03-endings"]],
    ]);
    expect(result.value[0]?.anchor).toBe("source-1");
  });

  it("is empty for a story without citations", () => {
    expect(collectSources([{ chapterId: "a", order: 1, title: "A", citations: [] }])).toEqual({ ok: true, value: [] });
  });

  it("refuses a citation id used twice — it is a footnote anchor", () => {
    const twice = [chapters[0]!, { ...chapters[1]!, citations: [{ ...chapters[1]!.citations[0]!, id: "cotton" }] }];
    expect(collectSources(twice)).toEqual({
      ok: false,
      error: { kind: "duplicate-citation", citationId: "cotton", chapters: ["01-sea", "02-rivers"] },
    });
  });

  it("refuses a link that is not a plain web link", () => {
    const unsafe = [{ ...chapters[1]!, citations: [{ id: "x", text: "x", source: "x", url: "javascript:alert(1)" }] }];
    expect(collectSources(unsafe)).toMatchObject({ ok: false, error: { kind: "unsafe-url", citationId: "x" } });
  });
});

describe("related stories", () => {
  it("ranks published stories by shared topics, then by date, and leaves out itself and the unpublished", () => {
    const result = relatedStories(aral, stories, now);
    expect(result).toEqual({
      ok: true,
      value: [
        { slug: "colorado-delta", title: "colorado-delta", dek: "About colorado-delta", sharedTopics: ["water", "irrigation", "shrinking-lakes"] },
        { slug: "lake-chad", title: "lake-chad", dek: "About lake-chad", sharedTopics: ["water", "shrinking-lakes"] },
        { slug: "canals", title: "canals", dek: "About canals", sharedTopics: ["irrigation"] },
      ],
    });
  });

  it("returns nothing when nothing is shared, or the story has no topics", () => {
    expect(relatedStories({ ...aral, topics: [] }, stories, now)).toEqual({ ok: true, value: [] });
    expect(relatedStories(aral, [aral], now)).toEqual({ ok: true, value: [] });
  });

  it("respects the limit", () => {
    const result = relatedStories(aral, stories, now, 1);
    expect(result.ok && result.value.map((story) => story.slug)).toEqual(["colorado-delta"]);
  });

  it("refuses a topic that is not kebab-case, naming the story", () => {
    expect(relatedStories(aral, [...stories, { ...aral, slug: "bad", topics: ["Shrinking Lakes"] }], now)).toEqual({
      ok: false,
      error: { kind: "invalid-topic", slug: "bad", topic: "Shrinking Lakes" },
    });
  });
});
