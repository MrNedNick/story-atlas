import { describe, expect, it } from "vitest";
import {
  DEFAULT_LAYOUT,
  countWords,
  createLayoutConfig,
  layoutCss,
  readingMinutes,
  resolveFigureLayout,
} from "../../src/domain/02-layout";
import { chapterMdx, flatHeadings, hugeBase, narrowMeasure, noGutter, plainLayout, wideNotWider } from "../fixtures/02-layout-fixtures";

describe("createLayoutConfig", () => {
  it("accepts the default editorial layout", () => {
    expect(createLayoutConfig(DEFAULT_LAYOUT)).toEqual({ ok: true, value: DEFAULT_LAYOUT });
  });

  it.each([
    [narrowMeasure, "invalid-measure"],
    [wideNotWider, "invalid-wide"],
    [noGutter, "invalid-gutter"],
    [hugeBase, "invalid-base"],
    [flatHeadings, "invalid-heading-ratio"],
  ])("rejects %o with a distinguishable error", (input, kind) => {
    const result = createLayoutConfig(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe(kind);
  });
});

describe("resolveFigureLayout", () => {
  it("gives maps and photos the wide column by default", () => {
    expect(resolveFigureLayout({ kind: "map" })).toBe("wide");
    expect(resolveFigureLayout({ kind: "photo" })).toBe("wide");
    expect(resolveFigureLayout({ kind: "chart" })).toBe("inline");
  });

  it("lets the author override the default", () => {
    expect(resolveFigureLayout({ kind: "map", layout: "full" })).toBe("full");
    expect(resolveFigureLayout({ kind: "chart", layout: "wide" })).toBe("wide");
  });
});

describe("reading time", () => {
  it("counts prose only", () => {
    // 11 + 7 + 9 words in the three prose lines.
    expect(countWords(chapterMdx)).toBe(27);
  });

  it("rounds to whole minutes and never shows zero", () => {
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(700)).toBe(3);
    expect(readingMinutes(2300)).toBe(10);
  });
});

describe("layoutCss", () => {
  const css = layoutCss(DEFAULT_LAYOUT);

  it("lays out content, wide and full columns", () => {
    expect(css).toContain("[content-start] min(38rem, 100% - 2rem) [content-end]");
    expect(css).toContain("[wide-start] minmax(0, 9rem)");
    expect(css).toContain('.story [data-layout="full"] {\n  grid-column: full;');
    expect(css).toContain("grid-template-columns: subgrid;");
  });

  it("scales headings fluidly up to the heading ratio", () => {
    expect(css).toContain("font-size: clamp(2.06rem, 2.06rem + 3vw, 3.433rem);");
  });

  it("only moves anything when the reader allows motion", () => {
    const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/g, "");
    expect(css).toContain("scroll-behavior: smooth");
    expect(outside).not.toMatch(/scroll-behavior|transition|animation/);
  });

  it("leaves out the drop cap and motion when turned off", () => {
    const plain = layoutCss(plainLayout);
    expect(plain).not.toContain("first-letter");
    expect(plain).not.toContain("prefers-reduced-motion");
  });
});
