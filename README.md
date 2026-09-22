# Story Atlas

A long-form editorial reader: illustrated stories with maps, charts and
citations, built with Astro, MDX and hand-authored SVG graphics. No
client-side framework — pages ship as static HTML, with interactivity added
only where a scenario genuinely needs it.

Work in progress: the content contract (story/chapter/illustration/citation)
and its validation are in place; the reading experience is being built on
top of it.

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
| `npm run build`       | Build the static site to `./dist/`          |
| `npm run preview`     | Preview the production build locally        |
| `npm run test`        | Run the unit test suite (Vitest)            |
| `npm run typecheck`   | Type-check the project (`astro check`)      |

## Project structure

```
src/
  domain/     pure content types and validation, framework-agnostic
  pages/      Astro routes
test/
  domain/     unit tests for src/domain
  fixtures/   sample content used by the domain tests
```
