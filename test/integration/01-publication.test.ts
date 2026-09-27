import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, inject, it } from 'vitest';

const checkDist = join('scripts', 'check-dist.mjs');
const outDir = inject('distDir');

function page(path: string): string {
  return readFileSync(join(outDir, path), 'utf8');
}

describe('publishing the real site (end to end)', () => {
  it('lists the published story on the index', () => {
    const index = page('index.html');
    expect(index).toContain('href="/stories/aral-sea/"');
    expect(index).toContain('href="/stories/lake-chad/"');
    expect(index).toContain('The Sea That Moved Away');
    expect(index).toContain('3 chapters');
  });

  it('renders every chapter in order with its figures and sources', () => {
    const story = page('stories/aral-sea/index.html');
    const headings = [...story.matchAll(/<h2 id="chapter-\d+-[^"]*-title"[^>]*>([^<]+)<\/h2>/g)].map((match) => match[1]);
    expect(headings).toEqual(['A sea in the desert', 'Rivers turned to fields', 'Two different endings']);
    // Two chapter maps plus three explainer steps.
    expect(story.match(/<img /g)).toHaveLength(5);
    expect(story).not.toMatch(/<img (?![^>]*alt="[^"]+")/);
    expect(story).toContain('https://earthobservatory.nasa.gov/world-of-change/AralSea');
  });

  it('passes the dist checks: no JavaScript, no missing images', () => {
    const result = spawnSync(process.execPath, [checkDist, outDir], { encoding: 'utf8' });
    expect(result.status).toBe(0);
    // The index and one page per published story.
    expect(result.stdout).toContain('3 pages, no scripts, all images present, all in-page links resolve');
  });
});

describe('dist checks catch broken output', () => {
  const broken = mkdtempSync(join(tmpdir(), 'story-atlas-broken-'));
  afterAll(() => rmSync(broken, { recursive: true, force: true }));

  it('fails on a page with a script and on an image that was never copied', () => {
    mkdirSync(join(broken, 'stories', 'x'), { recursive: true });
    writeFileSync(join(broken, 'index.html'), '<html><body><script>alert(1)</script></body></html>');
    writeFileSync(join(broken, 'stories', 'x', 'index.html'), '<img src="/stories/x/gone.svg" alt="Gone">');
    const result = spawnSync(process.execPath, [checkDist, broken], { encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('ships JavaScript');
    expect(result.stderr).toContain('missing image /stories/x/gone.svg');
  });
});
