// The site must read completely without JavaScript: fail the build if any page ships a script.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

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

const files = await htmlFiles('dist');
const offenders = [];
for (const file of files) {
  if (/<script\b/i.test(await readFile(file, 'utf8'))) offenders.push(file);
}
if (files.length === 0) {
  console.error('check-no-js: no HTML found in dist/ — run astro build first.');
  process.exit(1);
}
if (offenders.length > 0) {
  console.error(`check-no-js: these pages ship JavaScript:\n${offenders.join('\n')}`);
  process.exit(1);
}
console.log(`check-no-js: ${files.length} pages, no scripts.`);
