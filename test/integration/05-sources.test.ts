import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';
import type { Story } from '../../src/domain/01-content-schema';
import { storyRelated, storySources } from '../../src/features/05-sources';

const dist = inject('distDir');
const clean = (html: string) => html.replace(/ data-astro-cid-\w+/g, '');
const page = (slug: string) => clean(readFileSync(join(dist, 'stories', slug, 'index.html'), 'utf8'));
const section = (html: string, start: string, end: string) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)));
const css = (html: string) => [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(([, text]) => text).join('\n');

describe('sources and related stories on the built pages (end to end)', () => {
  it('ends a story with one numbered list of its sources, each linking back to the chapters that cite it', () => {
    const aral = page('aral-sea');
    const sources = section(aral, '<section class="source-list"', '</section>');
    const entries = [...sources.matchAll(/<li id="(source-\d+)">/g)].map(([, id]) => id);
    expect(entries).toEqual(['source-1', 'source-2']);
    // NASA is cited in chapters 2 and 3 and listed once.
    const nasa = section(sources, '<li id="source-2">', '</ul>');
    expect(nasa).toContain('NASA Earth Observatory');
    expect([...nasa.matchAll(/href="#(chapter-[^"]+)"/g)].map(([, id]) => id)).toEqual([
      'chapter-2-rivers-turned-to-fields',
      'chapter-3-two-different-endings',
    ]);
    for (const [, id] of nasa.matchAll(/href="#([^"]+)"/g)) expect(aral).toContain(`id="${id}"`);
  });

  it('links each story to the other one on the same topics, and says what they share', () => {
    const aral = section(page('aral-sea'), '<aside class="related"', '</aside>');
    const chad = section(page('lake-chad'), '<aside class="related"', '</aside>');
    expect(aral).toContain('href="/stories/lake-chad/"');
    expect(chad).toContain('href="/stories/aral-sea/"');
    expect(aral).toContain('Also about water, shrinking lakes');
  });

  it('works without JavaScript and without motion, and fits a narrow screen', () => {
    for (const slug of ['aral-sea', 'lake-chad']) {
      const html = page(slug);
      expect(html).not.toMatch(/<script\b/);
      const styles = css(html);
      expect(styles).toMatch(/\.work[^{]*\{[^}]*overflow-wrap:\s*anywhere/);
      expect(styles).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*16rem\),\s*1fr\)\)/);
      const related = styles.split('}').filter((rule) => /\.related|source-list|\.work|\.cited-in/.test(rule));
      expect(related.join('}')).not.toMatch(/transition|animation/);
    }
  });
});

describe('sources edge cases', () => {
  const story = (over: Partial<Story> = {}): Story => ({
    slug: 'test',
    title: 'Test',
    dek: 'Test',
    publishedAt: new Date('2026-09-01'),
    topics: ['water'],
    chapters: [
      { id: 'test/01', order: 1, title: 'One', bodyRef: 'test/01', illustrations: [], citations: [{ id: 'a', text: 'A', source: 'S' }] },
      { id: 'test/02', order: 2, title: 'Two', bodyRef: 'test/02', illustrations: [], citations: [{ id: 'a', text: 'B', source: 'T' }] },
    ],
    ...over,
  });

  it('stops the build on a footnote id used twice, naming the story and both chapters', () => {
    expect(() => storySources(story())).toThrow(/Story "test": citation id "a" is used in test\/01 and test\/02/);
  });

  it('stops the build on a non-web link and on a topic that is not kebab-case', () => {
    const unsafe = story();
    unsafe.chapters = [{ ...unsafe.chapters[0]!, citations: [{ id: 'x', text: 'X', source: 'X', url: 'javascript:alert(1)' }] }];
    expect(() => storySources(unsafe)).toThrow(/only http and https/);
    expect(() => storyRelated(story({ topics: ['Water'] }), [])).toThrow(/topic "Water" must be kebab-case/);
  });

  it('gives a story with no topics, or a lone story, an empty related list rather than an error', () => {
    expect(storyRelated(story({ topics: [] }), [story({ slug: 'other' })])).toEqual([]);
    expect(storyRelated(story(), [story()])).toEqual([]);
  });
});
