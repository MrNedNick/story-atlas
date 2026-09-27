import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';

const root = inject('distDir');
const pages = inject('pagesDistDir');
const read = (dist: string, file: string) => readFileSync(join(dist, file), 'utf8');

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

const checkDist = (dist: string, base: string) =>
  spawnSync(process.execPath, [join('scripts', 'check-dist.mjs'), dist], { encoding: 'utf8', env: { ...process.env, BASE_PATH: base } });

describe('feeds and previews on the built site (end to end)', () => {
  it('publishes an RSS feed with both stories, newest first, and a sitemap and robots.txt', () => {
    const rss = read(root, 'rss.xml');
    const links = [...rss.matchAll(/<link>([^<]+)<\/link>/g)].map(([, link]) => link);
    expect(links).toEqual(['http://localhost:4321/', 'http://localhost:4321/stories/lake-chad/', 'http://localhost:4321/stories/aral-sea/']);
    expect(rss).toMatch(/<pubDate>Thu, 24 Sep 2026 00:00:00 GMT<\/pubDate>/);
    expect(read(root, 'sitemap.xml').match(/<url>/g)).toHaveLength(3);
    expect(read(root, 'robots.txt')).toContain('Sitemap: http://localhost:4321/sitemap.xml');
  });

  it('gives each page a canonical URL, a feed link and preview tags, without a script', () => {
    const story = read(root, 'stories/aral-sea/index.html');
    expect(story).toContain('<link rel="canonical" href="http://localhost:4321/stories/aral-sea/">');
    expect(story).toContain('<link rel="alternate" type="application/rss+xml" title="Story Atlas" href="/rss.xml">');
    expect(story).toContain('<meta property="og:type" content="article">');
    expect(story).toContain('<meta property="article:published_time" content="2026-09-20T00:00:00.000Z">');
    // The first illustration is an SVG, which previews do not render: a text card, not a broken picture.
    expect(story).toContain('<meta name="twitter:card" content="summary">');
    expect(story).not.toContain('og:image');
    expect(read(root, 'index.html')).toContain('<meta property="og:type" content="website">');
    for (const file of htmlFiles(root)) expect(readFileSync(file, 'utf8')).not.toMatch(/<script\b/);
  });
});

describe('the same site built for a GitHub project page', () => {
  it('puts every link, image and feed address under /story-atlas/', () => {
    for (const file of htmlFiles(pages)) {
      const html = readFileSync(file, 'utf8');
      for (const [, path] of html.matchAll(/\b(?:href|src)="(\/[^"]*)"/g)) expect(path.startsWith('/story-atlas/')).toBe(true);
    }
    const rss = read(pages, 'rss.xml');
    expect(rss).toContain('<link>https://mrnednick.github.io/story-atlas/stories/aral-sea/</link>');
    expect(read(pages, 'stories/lake-chad/index.html')).toContain('<meta property="og:url" content="https://mrnednick.github.io/story-atlas/stories/lake-chad/">');
    expect(read(pages, 'index.html')).toContain('href="/story-atlas/stories/aral-sea/"');
  });

  it('passes the dist check for its base, and a root build does not', () => {
    const ok = checkDist(pages, '/story-atlas/');
    expect(ok.status).toBe(0);
    expect(ok.stdout).toContain('all paths under /story-atlas/, feeds present');

    // A build made for the domain root would break every link once served under a base path.
    const wrong = checkDist(root, '/story-atlas/');
    expect(wrong.status).toBe(1);
    expect(wrong.stderr).toMatch(/link \/stories\/aral-sea\/ is outside the base path \/story-atlas\//);
  });
});
