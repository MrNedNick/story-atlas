/**
 * Everything a static story site hands to the outside world besides its pages:
 * the RSS feed, the sitemap, robots.txt and the tags link previews are built from.
 * Pure string builders — the build writes them, nothing runs in the browser.
 */

export interface SiteConfig {
  /** Absolute origin the site is served from, e.g. `https://example.github.io`. */
  siteUrl: string;
  /** Path the site lives under: `/` at a domain root, `/story-atlas/` on a project page. */
  base: string;
  title: string;
  description: string;
}

export interface FeedStory {
  slug: string;
  title: string;
  dek: string;
  publishedAt: Date;
  updatedAt?: Date;
}

export interface PageMeta {
  title: string;
  description: string;
  /** Site-relative path without the base, e.g. `stories/aral-sea/`. */
  path: string;
  type: "website" | "article";
  /** Site-relative image path; only raster formats make a preview card. */
  image?: string;
  imageAlt?: string;
  publishedAt?: Date;
}

export interface MetaTag {
  /** `property` for Open Graph, `name` for the rest. */
  attribute: "property" | "name";
  key: string;
  content: string;
}

export type DistributionError =
  | { kind: "invalid-site-url"; value: string }
  | { kind: "invalid-base"; value: string }
  | { kind: "invalid-path"; value: string };

export type DistributionResult<T> = { ok: true; value: T } | { ok: false; error: DistributionError };

const RASTER = /\.(png|jpe?g|webp|gif)$/i;

/** http is allowed only for a local preview; anything public is https. */
export function parseSiteConfig(input: SiteConfig): DistributionResult<SiteConfig> {
  let url: URL;
  try {
    url = new URL(input.siteUrl);
  } catch {
    return { ok: false, error: { kind: "invalid-site-url", value: input.siteUrl } };
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.pathname !== "/" || url.search || url.hash || !(url.protocol === "https:" || (local && url.protocol === "http:"))) {
    return { ok: false, error: { kind: "invalid-site-url", value: input.siteUrl } };
  }
  if (!/^\/([a-z0-9-]+\/)*$/.test(input.base)) return { ok: false, error: { kind: "invalid-base", value: input.base } };
  return { ok: true, value: { ...input, siteUrl: url.origin } };
}

/** `stories/aral-sea/` under the base, as an absolute URL. */
export function absoluteUrl(config: SiteConfig, path: string): string {
  if (/^[a-z]+:/i.test(path) || path.includes("..")) throw new Error(`invalid-path: ${path}`);
  return `${config.siteUrl}${config.base}${path.replace(/^\/+/, "")}`;
}

/** A site-relative href that keeps working under a project-page base. */
export function sitePath(config: Pick<SiteConfig, "base">, path: string): string {
  return `${config.base}${path.replace(/^\/+/, "")}`;
}

export function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!);
}

/** RSS 2.0, newest first. Dates are RFC 822, as the format requires. */
export function buildRss(config: SiteConfig, stories: FeedStory[]): string {
  const items = [...stories]
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .map((story) => {
      const link = absoluteUrl(config, `stories/${story.slug}/`);
      return [
        "    <item>",
        `      <title>${escapeXml(story.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${story.publishedAt.toUTCString()}</pubDate>`,
        `      <description>${escapeXml(story.dek)}</description>`,
        "    </item>",
      ].join("\n");
    });
  const home = absoluteUrl(config, "");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(config.title)}</title>`,
    `    <link>${escapeXml(home)}</link>`,
    `    <description>${escapeXml(config.description)}</description>`,
    "    <language>en</language>",
    `    <atom:link href="${escapeXml(absoluteUrl(config, "rss.xml"))}" rel="self" type="application/rss+xml"/>`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

/** Home page plus one entry per story, with the last change as `lastmod`. */
export function buildSitemap(config: SiteConfig, stories: FeedStory[]): string {
  const day = (date: Date) => date.toISOString().slice(0, 10);
  const latest = stories.reduce<Date | null>((max, story) => {
    const changed = story.updatedAt ?? story.publishedAt;
    return !max || changed > max ? changed : max;
  }, null);
  const urls = [
    { loc: absoluteUrl(config, ""), lastmod: latest ? day(latest) : null },
    ...stories.map((story) => ({ loc: absoluteUrl(config, `stories/${story.slug}/`), lastmod: day(story.updatedAt ?? story.publishedAt) })),
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(({ loc, lastmod }) => `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`),
    "</urlset>",
    "",
  ].join("\n");
}

export function buildRobots(config: SiteConfig): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(config, "sitemap.xml")}\n`;
}

/**
 * Open Graph and Twitter tags for a page. Link previews do not render SVG, so an SVG (or no
 * image at all) gives a text card rather than a broken picture.
 */
export function metaTags(config: SiteConfig, page: PageMeta): DistributionResult<MetaTag[]> {
  if (/^[a-z]+:/i.test(page.path) || page.path.includes("..")) return { ok: false, error: { kind: "invalid-path", value: page.path } };
  const og = (key: string, content: string): MetaTag => ({ attribute: "property", key, content });
  const named = (key: string, content: string): MetaTag => ({ attribute: "name", key, content });
  const image = page.image && RASTER.test(page.image) ? absoluteUrl(config, page.image) : null;
  const tags: MetaTag[] = [
    og("og:site_name", config.title),
    og("og:type", page.type),
    og("og:title", page.title),
    og("og:description", page.description),
    og("og:url", absoluteUrl(config, page.path)),
    named("twitter:card", image ? "summary_large_image" : "summary"),
  ];
  if (image) {
    tags.push(og("og:image", image));
    if (page.imageAlt) tags.push(og("og:image:alt", page.imageAlt));
  }
  if (page.type === "article" && page.publishedAt) tags.push(og("article:published_time", page.publishedAt.toISOString()));
  return { ok: true, value: tags };
}
