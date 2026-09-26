// Checks the built site: pages must read without JavaScript, and every image they reference must exist.
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(path);
      return entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return nested.flat();
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const files = await htmlFiles(dist);
if (files.length === 0) {
  console.error(`check-dist: no HTML found in ${dist}/ — run astro build first.`);
  process.exit(1);
}

const problems = [];
for (const file of files) {
  const html = await readFile(file, 'utf8');
  if (/<script\b/i.test(html)) problems.push(`${file}: ships JavaScript`);
  for (const [, src] of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)) {
    if (!src.startsWith('/')) continue;
    if (!(await exists(join(dist, decodeURIComponent(src.split(/[?#]/)[0]))))) {
      problems.push(`${file}: missing image ${src}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`check-dist:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`check-dist: ${files.length} pages, no scripts, all images present.`);
