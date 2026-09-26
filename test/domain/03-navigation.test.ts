import { describe, expect, it } from "vitest";
import { buildToc, chapterAnchor, neighbours, slugify } from "../../src/domain/03-navigation";
import { blankTitle, cyrillicChapter, duplicateOrder, longChapter, shortChapter } from "../fixtures/03-navigation-fixtures";

describe("anchors", () => {
  it("keeps letters of any script and collapses the rest", () => {
    expect(slugify("Rivers turned to fields!")).toBe("rivers-turned-to-fields");
    expect(slugify("Две разные судьбы")).toBe("две-разные-судьбы");
    expect(slugify("  —  ")).toBe("");
  });

  it("includes the chapter number so equal titles stay unique", () => {
    expect(chapterAnchor(1, "Epilogue")).toBe("chapter-1-epilogue");
    expect(chapterAnchor(2, "Epilogue")).toBe("chapter-2-epilogue");
    expect(chapterAnchor(3, "…")).toBe("chapter-3");
  });
});

describe("buildToc", () => {
  it("lists chapters in order with their reading time", () => {
    const result = buildToc([cyrillicChapter, shortChapter]);
    expect(result.ok && result.value.map((entry) => [entry.id, entry.minutes])).toEqual([
      ["chapter-1-a-sea-in-the-desert", 1],
      ["chapter-3-две-разные-судьбы", 1],
    ]);
  });

  it("opens up long chapters into their sections, down to level 3", () => {
    const result = buildToc([shortChapter, longChapter]);
    if (!result.ok) throw new Error("toc should build");
    expect(result.value[0]?.sections).toEqual([]);
    expect(result.value[1]?.minutes).toBe(9);
    expect(result.value[1]?.sections).toEqual([
      { id: "the-canals", title: "The canals" },
      { id: "хлопок", title: "Хлопок" },
    ]);
  });

  it("rejects duplicate chapter numbers and blank titles", () => {
    expect(buildToc(duplicateOrder)).toEqual({ ok: false, error: { kind: "duplicate-order", order: 1 } });
    expect(buildToc(blankTitle)).toEqual({ ok: false, error: { kind: "empty-title", order: 1 } });
  });
});

describe("neighbours", () => {
  const toc = (() => {
    const result = buildToc([shortChapter, longChapter, cyrillicChapter]);
    if (!result.ok) throw new Error("toc should build");
    return result.value;
  })();

  it("finds the previous and next chapter", () => {
    const middle = neighbours(toc, "chapter-2-rivers-turned-to-fields");
    expect(middle.previous?.order).toBe(1);
    expect(middle.next?.order).toBe(3);
  });

  it("has no previous at the start, no next at the end, nothing for an unknown id", () => {
    expect(neighbours(toc, toc[0]!.id).previous).toBeUndefined();
    expect(neighbours(toc, toc[2]!.id).next).toBeUndefined();
    expect(neighbours(toc, "nope")).toEqual({});
  });
});
