import { parseSiteConfig, sitePath, type SiteConfig } from '../domain/06-distribution';

const SITE_TITLE = 'Story Atlas';
const SITE_DESCRIPTION = 'Illustrated long-form stories with maps, charts and sources.';

/**
 * The site's public address comes from the build: `site` and `base` in astro.config.mjs, set from
 * SITE_URL and BASE_PATH. A bad value stops the build instead of shipping broken links.
 */
export function siteConfig(): SiteConfig {
  const base = import.meta.env.BASE_URL ?? '/';
  const parsed = parseSiteConfig({
    siteUrl: import.meta.env.SITE ?? 'http://localhost:4321',
    base: base.endsWith('/') ? base : `${base}/`,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  });
  if (!parsed.ok) throw new Error(`Site configuration: ${parsed.error.kind} "${parsed.error.value}"`);
  return parsed.value;
}

/** A link or asset path that keeps working when the site lives under a base path. */
export function withBase(path: string): string {
  return sitePath(siteConfig(), path);
}
