import { describe, expect, it } from 'vitest';
import { storyToc, tocEntryFor } from '../../src/features/03-navigation';

const chapter = (order: number, title: string, body: string, headings = [] as { depth: number; slug: string; text: string }[]) => ({
  order,
  title,
  body,
  headings,
});

describe('storyToc', () => {
  it('builds contents from rendered chapters, counting prose in the MDX body', () => {
    const toc = storyToc('aral-sea', [chapter(2, 'Rivers', 'word '.repeat(460)), chapter(1, 'Desert', 'Short.')]);
    expect(toc.map((entry) => [entry.id, entry.minutes])).toEqual([
      ['chapter-1-desert', 1],
      ['chapter-2-rivers', 2],
    ]);
    expect(tocEntryFor(toc, 2).title).toBe('Rivers');
  });

  it('lists the sections of a long chapter', () => {
    const long = chapter(1, 'Long', `### Part one\n\n${'word '.repeat(1200)}`, [{ depth: 3, slug: 'part-one', text: 'Part one' }]);
    expect(storyToc('s', [long])[0]?.sections).toEqual([{ id: 'part-one', title: 'Part one' }]);
  });

  it('stops the build on duplicate chapter numbers, naming the story', () => {
    expect(() => storyToc('aral-sea', [chapter(1, 'A', 'x'), chapter(1, 'B', 'y')])).toThrow(
      /aral-sea.*duplicate-order/,
    );
  });

  it('fails loudly for a chapter missing from the contents', () => {
    expect(() => tocEntryFor([], 3)).toThrow('No contents entry for chapter 3');
  });
});
