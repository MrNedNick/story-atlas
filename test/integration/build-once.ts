import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    distDir: string;
    /** The same site built for a GitHub project page: https://mrnednick.github.io/story-atlas/. */
    pagesDistDir: string;
  }
}

export const PAGES_ENV = { SITE_URL: 'https://mrnednick.github.io', BASE_PATH: '/story-atlas/' };

/** Builds with exactly the given address settings, whatever the shell running the tests has set. */
function build(address: Partial<typeof PAGES_ENV>): string {
  const outDir = mkdtempSync(join(tmpdir(), 'story-atlas-build-'));
  const { SITE_URL: _site, BASE_PATH: _base, ...env } = process.env;
  execFileSync(process.execPath, [join('node_modules', 'astro', 'bin', 'astro.mjs'), 'build', '--outDir', outDir], {
    stdio: 'pipe',
    env: { ...env, ...address },
  });
  return outDir;
}

/**
 * Builds the real site once for all integration tests — at a domain root and under a project-page
 * base — one after the other: two Astro builds in parallel would share its cache.
 */
export default function setup(project: TestProject) {
  const root = build({});
  const pages = build(PAGES_ENV);
  project.provide('distDir', root);
  project.provide('pagesDistDir', pages);
  return () => {
    rmSync(root, { recursive: true, force: true });
    rmSync(pages, { recursive: true, force: true });
  };
}
