import type { Illustration } from "./01-content-schema";

export type FigureLayout = "inline" | "wide" | "full";

/** The editorial page: a text column, a wider column for figures, and full bleed. All sizes in rem. */
export interface LayoutConfig {
  measureRem: number;
  wideRem: number;
  gutterRem: number;
  baseSizeRem: number;
  /** Ratio between heading levels, e.g. 1.25. */
  headingRatio: number;
  dropCap: boolean;
  /** Smooth scrolling to in-page anchors; only ever applied when the reader allows motion. */
  smoothScroll: boolean;
}

export type LayoutError =
  | { kind: "invalid-measure"; measureRem: number }
  | { kind: "invalid-wide"; wideRem: number; measureRem: number }
  | { kind: "invalid-gutter"; gutterRem: number }
  | { kind: "invalid-base"; baseSizeRem: number }
  | { kind: "invalid-heading-ratio"; headingRatio: number };

export type LayoutResult<T> = { ok: true; value: T } | { ok: false; error: LayoutError };

export const DEFAULT_LAYOUT: LayoutConfig = {
  measureRem: 38,
  wideRem: 56,
  gutterRem: 1,
  baseSizeRem: 1.125,
  headingRatio: 1.25,
  dropCap: true,
  smoothScroll: true,
};

const DEFAULT_FIGURE_LAYOUT: Record<Illustration["kind"], FigureLayout> = {
  map: "wide",
  photo: "wide",
  chart: "inline",
  diagram: "inline",
};

const WORDS_PER_MINUTE = 230;

function between(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

export function createLayoutConfig(input: LayoutConfig): LayoutResult<LayoutConfig> {
  // 20–50rem keeps a line at roughly 45–100 characters.
  if (!between(input.measureRem, 20, 50)) return { ok: false, error: { kind: "invalid-measure", measureRem: input.measureRem } };
  if (!between(input.wideRem, input.measureRem + 4, 100)) {
    return { ok: false, error: { kind: "invalid-wide", wideRem: input.wideRem, measureRem: input.measureRem } };
  }
  if (!between(input.gutterRem, 0.5, 4)) return { ok: false, error: { kind: "invalid-gutter", gutterRem: input.gutterRem } };
  if (!between(input.baseSizeRem, 0.875, 1.5)) return { ok: false, error: { kind: "invalid-base", baseSizeRem: input.baseSizeRem } };
  if (!between(input.headingRatio, 1.05, 1.6)) {
    return { ok: false, error: { kind: "invalid-heading-ratio", headingRatio: input.headingRatio } };
  }
  return { ok: true, value: { ...input } };
}

/** Maps and photos need room; charts and diagrams stay with the text unless the author says otherwise. */
export function resolveFigureLayout(illustration: Pick<Illustration, "kind" | "layout">): FigureLayout {
  return illustration.layout ?? DEFAULT_FIGURE_LAYOUT[illustration.kind];
}

/** Words in an MDX body: code, imports/exports, tags and Markdown punctuation are not read aloud. */
export function countWords(mdx: string): number {
  const prose = mdx
    .replace(/^---[\s\S]*?---/, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*(import|export)\s.*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~[\]()|-]/g, " ");
  return prose.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * The layout as CSS. Children of `.story` and of its `.chapter`s sit in the
 * text column; figures choose `wide` or `full` with `data-layout`. Headings scale fluidly between
 * the narrow and the wide viewport. Motion is emitted only inside
 * `prefers-reduced-motion: no-preference`.
 */
export function layoutCss(config: LayoutConfig): string {
  const { measureRem, wideRem, gutterRem, baseSizeRem, headingRatio } = config;
  const half = round((wideRem - measureRem) / 2);
  const h1Max = round(baseSizeRem * headingRatio ** 5);
  const h2Max = round(baseSizeRem * headingRatio ** 3);
  const blocks = [
    `.story {
  display: grid;
  grid-template-columns:
    [full-start] minmax(${gutterRem}rem, 1fr)
    [wide-start] minmax(0, ${half}rem)
    [content-start] min(${measureRem}rem, 100% - ${gutterRem * 2}rem) [content-end]
    minmax(0, ${half}rem) [wide-end]
    minmax(${gutterRem}rem, 1fr) [full-end];
  font-size: ${baseSizeRem}rem;
}`,
    // Chapters span the whole grid and pass its columns on, so a figure inside a chapter can break out.
    `.story > *,
.story .chapter > * {
  grid-column: content;
}`,
    `.story > .chapter {
  grid-column: full;
  display: grid;
  grid-template-columns: subgrid;
}`,
    `.story [data-layout="wide"] {
  grid-column: wide;
}`,
    `.story [data-layout="full"] {
  grid-column: full;
}`,
    `.story h1 {
  font-size: clamp(${round(h1Max * 0.6)}rem, ${round(h1Max * 0.6)}rem + 3vw, ${h1Max}rem);
}`,
    `.story h2 {
  font-size: clamp(${round(h2Max * 0.8)}rem, ${round(h2Max * 0.8)}rem + 1vw, ${h2Max}rem);
}`,
  ];
  if (config.dropCap) {
    blocks.push(`.story .chapter:first-of-type > p:first-of-type::first-letter {
  float: left;
  margin: 0.08em 0.1em 0 0;
  font-size: 3.4em;
  line-height: 0.8;
}`);
  }
  if (config.smoothScroll) {
    blocks.push(`@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}`);
  }
  return `${blocks.join("\n\n")}\n`;
}
