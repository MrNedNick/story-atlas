# Example: content schema and publication

The first scenario: write a story as files, build, and read it as plain HTML.

## Walkthrough

1. Create a folder under `src/content/stories/` named after the story's URL
   slug, e.g. `aral-sea/`.
2. Add `story.json` with the title, the dek (one-sentence summary) and
   `publishedAt` (and optionally `updatedAt`).
3. Add chapters as numbered MDX files (`01-….mdx`, `02-….mdx`). Front matter
   holds `order`, `title`, and the chapter's `illustrations` (map, chart,
   photo or diagram, each with `alt` text) and `citations`.
4. Put illustrations in `public/stories/<slug>/`.
5. `npm run build`. Both collections are validated with the schemas from
   `src/domain/01-content-schema.ts`, joined into stories
   (`composeStories` in `src/features/01-publication.ts`) and rendered to
   `dist/index.html` and `dist/stories/<slug>/index.html`. Stories whose
   `publishedAt` is still in the future are left out.

## Edge cases covered

| Case | Where it's handled |
|---|---|
| No JavaScript | Pages are static HTML; `scripts/check-dist.mjs` fails the build if any page contains a `<script>` |
| Missing asset | The same check fails the build if an `<img src>` points at a file that is not in `dist/` |
| Broken content | A story without chapters, a chapter without a story, an illustration without alt text: the build stops with `Content errors:` and the story's name |
| Narrow screen | One column with a readable measure; long words wrap (`overflow-wrap`, `hyphens: auto`); figures scale to the column |
| Long chapter | Text flows in a 38rem measure; chapter navigation comes with the chapters stage |
| Reduced motion | The site has no animation or transitions, so there is nothing to reduce |

## Automated coverage

- `test/domain/01-content-schema.test.ts` — the contract (T1).
- `test/features/01-publication.test.ts` — joining collections, ordering,
  errors and scheduling (T2).
- `test/integration/01-publication.test.ts` — builds the real site into a
  temporary folder and checks the index, the story page, the chapter order,
  figures with alt text, sources, and the dist checks; plus a broken `dist`
  the checks must reject (T3).

## Try it

```bash
npm run build
npm run preview
```
