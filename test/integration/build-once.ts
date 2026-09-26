import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    distDir: string;
  }
}

/** Builds the real site once for all integration tests; two Astro builds in parallel would share its cache. */
export default function setup(project: TestProject) {
  const outDir = mkdtempSync(join(tmpdir(), 'story-atlas-build-'));
  execFileSync(process.execPath, [join('node_modules', 'astro', 'bin', 'astro.mjs'), 'build', '--outDir', outDir], {
    stdio: 'pipe',
  });
  project.provide('distDir', outDir);
  return () => rmSync(outDir, { recursive: true, force: true });
}
