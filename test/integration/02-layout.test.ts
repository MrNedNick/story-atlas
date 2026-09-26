import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';
import { DEFAULT_LAYOUT } from '../../src/domain/02-layout';
import { siteLayoutCss, storyReadingMinutes } from '../../src/features/02-layout';

const story = readFileSync(join(inject('distDir'), 'stories', 'aral-sea', 'index.html'), 'utf8');

describe('editorial layout on the built story page (end to end)', () => {
  it('inlines the layout CSS in the head, without any script', () => {
    const head = story.slice(0, story.indexOf('</head>'));
    expect(head).toContain('grid-template-columns: subgrid;');
    expect(head).toContain('[wide-start]');
    expect(story).not.toMatch(/<script\b/);
  });

  it('keeps smooth scrolling behind the reduced-motion preference', () => {
    const css = story.slice(story.indexOf('.story {'), story.indexOf('</style>', story.indexOf('.story {')));
    const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/g, '');
    expect(css).toContain('scroll-behavior: smooth');
    expect(outside).not.toContain('scroll-behavior');
  });

  it('puts both maps in the wide column and shows the reading time', () => {
    expect(story.match(/<figure[^>]*data-layout="wide"/g)).toHaveLength(2);
    expect(story).toMatch(/1 min read/);
  });
});

describe('layout edge cases', () => {
  it('stops the build on an invalid layout configuration', () => {
    expect(() => siteLayoutCss({ ...DEFAULT_LAYOUT, measureRem: 90 })).toThrow(/invalid-measure/);
  });

  it('scales the reading time with a long chapter', () => {
    const paragraph = 'word '.repeat(230 * 12);
    expect(storyReadingMinutes([paragraph])).toBe(12);
    expect(storyReadingMinutes([paragraph, paragraph])).toBe(24);
  });
});
