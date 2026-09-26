# Story Atlas

A long-form editorial reader: illustrated stories with maps, charts and
citations, built with Astro, MDX and hand-authored SVG graphics. No
client-side framework — pages ship as static HTML, with interactivity added
only where a scenario genuinely needs it.

Work in progress. What works today:

- Stories are content collections: one folder per story with a `story.json`
  (title, dek, dates) and numbered MDX chapters whose front matter lists the
  chapter's illustrations and sources.
- At build time every story is validated against the content contract; broken
  content — a story with no chapters, a chapter outside any story, an image
  without alt text — stops the build with a message naming the story.
- The site is plain static HTML: an index of published stories (scheduled
  ones stay hidden) and a page per story with its chapters, figures and
  sources. The build fails if any page ships JavaScript or references an
  image that is not in the output — see
  [`docs/examples/01-content-and-publication.md`](docs/examples/01-content-and-publication.md).

## Stack

- [Astro](https://astro.build) — static site generation
- [MDX](https://mdxjs.com) — chapter content with embedded components
- [Zod](https://zod.dev) — content schema validation
- [Vitest](https://vitest.dev) — unit tests

## Commands

| Command             | Action                                      |
| :------------------ | :------------------------------------------ |
| `npm install`        | Install dependencies                        |
| `npm run dev`         | Start the dev server at `localhost:4321`    |
| `npm run build`       | Build the static site to `./dist/`, then check that no page ships JavaScript and every image exists |
| `npm run preview`     | Preview the production build locally        |
| `npm run test`        | Run the unit test suite (Vitest)            |
| `npm run typecheck`   | Type-check the project (`astro check`)      |

## Project structure

```
src/
  content/    stories: <slug>/story.json + numbered MDX chapters
  content.config.ts  collections, validated with the domain schemas
  domain/     pure content types and validation, framework-agnostic
  features/   building the story catalogue from collection entries
  adapters/   Astro content API → domain stories
  layouts/, components/, pages/   the static site
public/stories/   illustrations (hand-authored SVG)
scripts/      build checks
test/
  domain/, features/   unit tests
  fixtures/   sample content used by the tests
```

Requires Node 22.12 or newer (see `.nvmrc`).
