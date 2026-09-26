import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Whether a site-absolute path such as `/stories/x/map.svg` exists in `public/` at build time. */
export function publicAssetExists(src: string): boolean {
  return existsSync(join(process.cwd(), 'public', decodeURIComponent(src.split(/[?#]/)[0] ?? src)));
}
