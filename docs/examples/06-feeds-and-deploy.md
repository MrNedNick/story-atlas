# Example: feeds, link previews and a static deploy

The last scenario: the story leaves the site — in a feed reader, as a link
pasted into a chat, in a search index — and the whole site goes out as static
files.

## Walkthrough

1. Build the site: `npm run build`. Next to the pages, `dist/` now holds:
   - `rss.xml` — an RSS 2.0 feed of the published stories, newest first;
   - `sitemap.xml` — the home page and every story, dated by their last change;
   - `robots.txt` — pointing at the sitemap.
2. Open a story's source: it has a `canonical` link, a link to the feed, and
   Open Graph / Twitter tags — title, description, the story's absolute URL,
   `og:type` *article* and its publication date.
3. Link previews do not render SVG, and every illustration here is a
   hand-authored SVG, so stories get a text card (`twitter:card` *summary*)
   rather than a broken picture. A raster image placed first in a story would
   be used as a large card automatically.

## Serving from a sub-path

A GitHub project page lives under the repository name, so every link must
start with it. Two settings describe where the site will be served:

```bash
SITE_URL=https://mrnednick.github.io BASE_PATH=/story-atlas/ npm run build
```

Every internal link, image and feed address then starts with `/story-atlas/`
(`withBase` in `src/features/06-distribution.ts`), and the build check fails
if anything still points at the domain root. `.github/workflows/pages.yml`
runs the tests, builds with these settings from the repository name and
publishes `dist/` to GitHub Pages.

Crawlers read `robots.txt` only at the root of a domain, so on a project page
it is informational; the sitemap is still found through it when the site is
served from a domain root.

## Edge cases covered

| Case | Where it's handled |
|---|---|
| No JavaScript | Feeds and tags are generated at build time; the build check rejects scripts |
| A link that ignores the base path | `scripts/check-dist.mjs` fails with the page and the link |
| `SITE_URL` with a path, plain `http` on a public host, a base without slashes | The build stops (`invalid-site-url`, `invalid-base`) |
| Text with `&` or `<` in a title or dek | Escaped in the feed and the sitemap |
| No stories yet | A valid, empty feed |

`test/integration/06-distribution.test.ts` builds the site both ways and
checks all of this.
