import { readingMinutes } from "./02-layout";

/** A heading inside a chapter body, as the MDX renderer reports it. */
export interface BodyHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface ChapterOutline {
  order: number;
  title: string;
  words: number;
  headings: BodyHeading[];
}

export interface TocSection {
  id: string;
  title: string;
}

export interface TocEntry {
  id: string;
  order: number;
  title: string;
  minutes: number;
  /** Listed only for long chapters, so a reader can jump inside them. */
  sections: TocSection[];
}

export type NavigationError =
  | { kind: "duplicate-order"; order: number }
  | { kind: "empty-title"; order: number };

export type NavigationResult<T> = { ok: true; value: T } | { ok: false; error: NavigationError };

/** Chapters at least this long get their sections in the table of contents. */
export const LONG_CHAPTER_MINUTES = 5;

/** URL fragment for any script: letters and digits kept (Cyrillic included), everything else becomes a dash. */
export function slugify(text: string): string {
  return text
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** Anchors carry the order, so two chapters with the same title still get different ids. */
export function chapterAnchor(order: number, title: string): string {
  const slug = slugify(title);
  return slug ? `chapter-${order}-${slug}` : `chapter-${order}`;
}

export function buildToc(chapters: ChapterOutline[]): NavigationResult<TocEntry[]> {
  const seen = new Set<number>();
  for (const chapter of chapters) {
    if (seen.has(chapter.order)) return { ok: false, error: { kind: "duplicate-order", order: chapter.order } };
    seen.add(chapter.order);
    if (!chapter.title.trim()) return { ok: false, error: { kind: "empty-title", order: chapter.order } };
  }
  const entries = [...chapters]
    .sort((a, b) => a.order - b.order)
    .map((chapter) => {
      const minutes = readingMinutes(chapter.words);
      return {
        id: chapterAnchor(chapter.order, chapter.title),
        order: chapter.order,
        title: chapter.title,
        minutes,
        sections:
          minutes >= LONG_CHAPTER_MINUTES
            ? chapter.headings
                .filter((heading) => heading.depth <= 3 && heading.text.trim())
                .map((heading) => ({ id: heading.slug, title: heading.text }))
            : [],
      };
    });
  return { ok: true, value: entries };
}

export interface Neighbours {
  previous?: TocEntry;
  next?: TocEntry;
}

export function neighbours(toc: TocEntry[], id: string): Neighbours {
  const index = toc.findIndex((entry) => entry.id === id);
  if (index === -1) return {};
  return { previous: toc[index - 1], next: toc[index + 1] };
}
