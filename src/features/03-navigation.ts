import { countWords } from '../domain/02-layout';
import { type BodyHeading, type TocEntry, buildToc } from '../domain/03-navigation';

export interface RenderedChapter {
  order: number;
  title: string;
  body: string;
  headings: BodyHeading[];
}

/** Contents of a story from its rendered chapters; broken chapter numbering stops the build. */
export function storyToc(storySlug: string, chapters: RenderedChapter[]): TocEntry[] {
  const toc = buildToc(
    chapters.map(({ order, title, body, headings }) => ({ order, title, words: countWords(body), headings })),
  );
  if (!toc.ok) throw new Error(`Story "${storySlug}" navigation: ${JSON.stringify(toc.error)}`);
  return toc.value;
}

export function tocEntryFor(toc: TocEntry[], order: number): TocEntry {
  const entry = toc.find((candidate) => candidate.order === order);
  if (!entry) throw new Error(`No contents entry for chapter ${order}`);
  return entry;
}
