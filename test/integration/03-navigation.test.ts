import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, inject, it } from 'vitest';

const story = readFileSync(join(inject('distDir'), 'stories', 'aral-sea', 'index.html'), 'utf8');

describe('chapter navigation on the built story page (end to end)', () => {
  it('opens with contents that link to every chapter with its reading time', () => {
    const contents = story.slice(story.indexOf('id="contents"'), story.indexOf('</nav>', story.indexOf('id="contents"')));
    const links = [...contents.matchAll(/href="#([^"]+)"/g)].map(([, id]) => id);
    expect(links).toEqual([
      'chapter-1-a-sea-in-the-desert',
      'chapter-2-rivers-turned-to-fields',
      'chapter-3-two-different-endings',
    ]);
    expect(contents.match(/1 min/g)).toHaveLength(3);
    for (const id of links) expect(story).toContain(`<section class="chapter" id="${id}"`);
  });

  it('links each chapter to its neighbours and back to the contents, without JavaScript', () => {
    const navs = [...story.matchAll(/<nav class="chapter-nav"[\s\S]*?<\/nav>/g)].map(([nav]) => nav);
    expect(navs).toHaveLength(3);
    expect(navs[0]).not.toContain('rel="prev"');
    expect(navs[1]).toContain('href="#chapter-1-a-sea-in-the-desert" rel="prev"');
    expect(navs[1]).toContain('href="#chapter-3-two-different-endings" rel="next"');
    expect(navs[2]).not.toContain('rel="next"');
    expect(navs.every((nav) => nav.includes('href="#contents"'))).toBe(true);
    expect(story).not.toMatch(/<script\b/);
  });
});

describe('dist checks catch a broken in-page link', () => {
  const broken = mkdtempSync(join(tmpdir(), 'story-atlas-anchors-'));
  afterAll(() => rmSync(broken, { recursive: true, force: true }));

  it('fails when a link points at an id that is not on the page', () => {
    writeFileSync(join(broken, 'index.html'), '<a href="#chapter-9">Nine</a><section id="chapter-1"></section>');
    const result = spawnSync(process.execPath, [join('scripts', 'check-dist.mjs'), broken], { encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('link to missing #chapter-9');
  });
});
