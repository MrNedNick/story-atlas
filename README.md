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
- Story pages use an editorial grid: text in a 38rem measure, maps in a wider
  column, fluid headings, a drop cap and the reading time — all CSS, with
  motion only when the reader allows it — see
  [`docs/examples/02-editorial-layout.md`](docs/examples/02-editorial-layout.md).
- Every story opens with contents (reading time per chapter, sections for
  long chapters) and each chapter links to its neighbours; the build checks
  that every in-page link lands somewhere — see
  [`docs/examples/03-chapters-navigation.md`](docs/examples/03-chapters-navigation.md).
- A chapter can hold a step-through explainer — the same map at several points
  in time, switched with a group of radio buttons and CSS `:has()`, still
  with no JavaScript; a missing step image stops the build — see
  [`docs/examples/04-explainers.md`](docs/examples/04-explainers.md).
- Each story ends with one numbered source list — every cited work once, with
  links back to the chapters that cite it — and related stories on shared
  topics; a duplicate footnote id or a non-web link stops the build — see
  [`docs/examples/05-sources-related.md`](docs/examples/05-sources-related.md).
  There are two stories now: the Aral Sea and Lake Chad.

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
| `npm run build`       | Build the static site to `./dist/`, then check that no page ships JavaScript, every image exists and every in-page link resolves |
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
