import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  buildRobots,
  buildRss,
  buildSitemap,
  metaTags,
  parseSiteConfig,
  sitePath,
} from "../../src/domain/06-distribution";
import { feedStories, pagesConfig, rootConfig } from "../fixtures/06-distribution-fixtures";

describe("site configuration", () => {
  it("accepts a project page under a base path, and a local preview at the root", () => {
    expect(parseSiteConfig(pagesConfig)).toEqual({ ok: true, value: pagesConfig });
    expect(parseSiteConfig(rootConfig)).toMatchObject({ ok: true, value: { siteUrl: "http://localhost:4321" } });
  });

  it("refuses a public http site, a URL with a path, and a base without slashes", () => {
    expect(parseSiteConfig({ ...pagesConfig, siteUrl: "http://example.com" })).toMatchObject({ ok: false, error: { kind: "invalid-site-url" } });
    expect(parseSiteConfig({ ...pagesConfig, siteUrl: "https://example.com/story-atlas" })).toMatchObject({ ok: false, error: { kind: "invalid-site-url" } });
    expect(parseSiteConfig({ ...pagesConfig, siteUrl: "not a url" })).toMatchObject({ ok: false, error: { kind: "invalid-site-url" } });
    expect(parseSiteConfig({ ...pagesConfig, base: "story-atlas" })).toEqual({ ok: false, error: { kind: "invalid-base", value: "story-atlas" } });
  });

  it("builds absolute URLs and site paths under the base", () => {
    expect(absoluteUrl(pagesConfig, "stories/aral-sea/")).toBe("https://mrnednick.github.io/story-atlas/stories/aral-sea/");
    expect(sitePath(pagesConfig, "/stories/aral-sea/")).toBe("/story-atlas/stories/aral-sea/");
    expect(() => absoluteUrl(pagesConfig, "../secret")).toThrow(/invalid-path/);
  });
});

describe("feed, sitemap and robots", () => {
  it("writes RSS 2.0 newest first, with escaped text and RFC 822 dates", () => {
    const rss = buildRss(pagesConfig, feedStories);
    expect(rss).toContain('<rss version="2.0"');
    expect(rss.indexOf("lake-chad")).toBeLessThan(rss.indexOf("aral-sea"));
    expect(rss).toContain("<description>Two rivers &amp; a &lt;sea&gt;</description>");
    expect(rss).toContain("<pubDate>Sun, 20 Sep 2026 00:00:00 GMT</pubDate>");
    expect(rss).toContain('<atom:link href="https://mrnednick.github.io/story-atlas/rss.xml" rel="self"');
    expect(rss).toContain("<description>Illustrated long-form stories with maps, charts &amp; sources.</description>");
  });

  it("is a valid, empty feed when there are no stories yet", () => {
    const rss = buildRss(pagesConfig, []);
    expect(rss).not.toContain("<item>");
    expect(rss).toContain("</channel>");
  });

  it("lists the home page and every story in the sitemap, dated by their last change", () => {
    const sitemap = buildSitemap(pagesConfig, feedStories);
    expect(sitemap).toContain("<url><loc>https://mrnednick.github.io/story-atlas/</loc><lastmod>2026-09-26</lastmod></url>");
    expect(sitemap).toContain("<loc>https://mrnednick.github.io/story-atlas/stories/lake-chad/</loc><lastmod>2026-09-26</lastmod>");
    expect(sitemap).toContain("<loc>https://mrnednick.github.io/story-atlas/stories/aral-sea/</loc><lastmod>2026-09-20</lastmod>");
    expect(buildRobots(pagesConfig)).toContain("Sitemap: https://mrnednick.github.io/story-atlas/sitemap.xml");
  });
});

describe("link preview tags", () => {
  const page = {
    title: "The Sea That Moved Away",
    description: "How two rivers were turned into cotton fields",
    path: "stories/aral-sea/",
    type: "article" as const,
    publishedAt: new Date("2026-09-20T00:00:00Z"),
  };

  it("describes an article with an absolute URL and its date, and a text card without a raster image", () => {
    const result = metaTags(pagesConfig, { ...page, image: "stories/aral-sea/basin.svg" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const byKey = Object.fromEntries(result.value.map((tag) => [tag.key, tag.content]));
    expect(byKey["og:url"]).toBe("https://mrnednick.github.io/story-atlas/stories/aral-sea/");
    expect(byKey["og:type"]).toBe("article");
    expect(byKey["article:published_time"]).toBe("2026-09-20T00:00:00.000Z");
    // An SVG would show as a broken picture in most previews.
    expect(byKey["og:image"]).toBeUndefined();
    expect(byKey["twitter:card"]).toBe("summary");
  });

  it("uses a raster image as a large card, with its alt text", () => {
    const result = metaTags(pagesConfig, { ...page, image: "og/aral-sea.png", imageAlt: "The Aral Sea in 1960" });
    expect(result.ok && result.value).toEqual(
      expect.arrayContaining([
        { attribute: "property", key: "og:image", content: "https://mrnednick.github.io/story-atlas/og/aral-sea.png" },
        { attribute: "property", key: "og:image:alt", content: "The Aral Sea in 1960" },
        { attribute: "name", key: "twitter:card", content: "summary_large_image" },
      ]),
    );
  });

  it("refuses a path that leaves the site", () => {
    expect(metaTags(pagesConfig, { ...page, path: "https://evil.example/" })).toEqual({
      ok: false,
      error: { kind: "invalid-path", value: "https://evil.example/" },
    });
  });
});
