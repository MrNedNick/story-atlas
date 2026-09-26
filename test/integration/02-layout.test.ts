import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DEFAULT_LAYOUT } from '../../src/domain/02-layout';
import { siteLayoutCss, storyReadingMinutes } from '../../src/features/02-layout';

const outDir = mkdtempSync(join(tmpdir(), 'story-atlas-layout-'));
let story = '';

describe('editorial layout on the built story page (end to end)', () => {
  beforeAll(() => {
    execFileSync(process.execPath, [join('node_modules', 'astro', 'bin', 'astro.mjs'), 'build', '--outDir', outDir], {
      stdio: 'pipe',
    });
    story = readFileSync(join(outDir, 'stories', 'aral-sea', 'index.html'), 'utf8');
  }, 120_000);

  afterAll(() => rmSync(outDir, { recursive: true, force: true }));

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
