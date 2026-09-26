import { describe, expect, it } from 'vitest';
import { composeStories, describeError, publishedStories, type Entry } from '../../src/features/01-publication';

const story = (id: string, publishedAt: string): Entry => ({
  id,
  data: { title: `Story ${id}`, dek: 'A dek.', publishedAt: new Date(publishedAt) },
});

const chapter = (id: string, order: number, extra: Record<string, unknown> = {}): Entry => ({
  id,
  data: { order, title: `Chapter ${order}`, illustrations: [], citations: [], ...extra },
});

describe('composeStories', () => {
  it('joins each story with the chapters in its folder, in reading order', () => {
    const { stories, errors } = composeStories(
      [story('aral-sea', '2026-09-20')],
      [chapter('aral-sea/02-fields', 2), chapter('aral-sea/01-desert', 1)],
    );
    expect(errors).toEqual([]);
    expect(stories[0]?.slug).toBe('aral-sea');
    expect(stories[0]?.chapters.map((c) => c.bodyRef)).toEqual(['aral-sea/01-desert', 'aral-sea/02-fields']);
  });

  it('reports a story without chapters instead of publishing an empty page', () => {
    const { stories, errors } = composeStories([story('empty-story', '2026-09-20')], []);
    expect(stories).toEqual([]);
    expect(errors[0]?.kind).toBe('content');
    expect(describeError(errors[0]!)).toMatch(/empty-story.*chapter/);
  });

  it('reports chapters whose folder has no story.json', () => {
    const { errors } = composeStories([], [chapter('lost/01-alone', 1)]);
    expect(errors).toEqual([{ kind: 'orphan-chapter', chapterId: 'lost/01-alone' }]);
    expect(describeError(errors[0]!)).toBe('Chapter "lost/01-alone" has no story.json in its folder.');
  });

  it('rejects an illustration without alt text, naming the story', () => {
    const { errors } = composeStories(
      [story('maps', '2026-09-20')],
      [chapter('maps/01-one', 1, { illustrations: [{ id: 'm', kind: 'map', src: '/m.svg', alt: '' }] })],
    );
    expect(describeError(errors[0]!)).toMatch(/^Story "maps": .*alt/);
  });
});

describe('publishedStories', () => {
  const { stories } = composeStories(
    [story('old', '2025-01-01'), story('new', '2026-09-01'), story('scheduled', '2030-01-01')],
    [chapter('old/01-a', 1), chapter('new/01-a', 1), chapter('scheduled/01-a', 1)],
  );

  it('lists published stories newest first and keeps scheduled ones out', () => {
    expect(publishedStories(stories, new Date('2026-09-25')).map((s) => s.slug)).toEqual(['new', 'old']);
  });

  it('is empty before anything is published', () => {
    expect(publishedStories(stories, new Date('2024-01-01'))).toEqual([]);
  });
});
