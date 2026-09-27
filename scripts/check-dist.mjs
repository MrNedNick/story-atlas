// Checks the built site: pages must read without JavaScript, every image they reference must exist,
// and every in-page link must point at an element on that page.
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
// The path the site is served under (BASE_PATH at build time): every internal link and image must use it.
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');

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
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id));
  for (const [, fragment] of html.matchAll(/\bhref="#([^"]+)"/g)) {
    if (!ids.has(decodeURIComponent(fragment))) problems.push(`${file}: link to missing #${fragment}`);
  }
  for (const [, src] of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)) {
    if (!src.startsWith('/')) continue;
    if (!src.startsWith(base)) {
      problems.push(`${file}: image ${src} is outside the base path ${base}`);
      continue;
    }
    if (!(await exists(join(dist, decodeURIComponent(src.slice(base.length).split(/[?#]/)[0]))))) {
      problems.push(`${file}: missing image ${src}`);
    }
  }
  for (const [, href] of html.matchAll(/\bhref="(\/[^"]*)"/g)) {
    if (!href.startsWith(base)) problems.push(`${file}: link ${href} is outside the base path ${base}`);
  }
}

// What feed readers and search engines ask for.
for (const file of ['rss.xml', 'sitemap.xml', 'robots.txt']) {
  if (!(await exists(join(dist, file)))) problems.push(`missing ${file}`);
}

if (problems.length > 0) {
  console.error(`check-dist:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`check-dist: ${files.length} pages, no scripts, all images present, all in-page links resolve, all paths under ${base}, feeds present.`);
