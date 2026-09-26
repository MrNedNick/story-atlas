# Example: editorial layout

The second scenario: the story page as an editorial layout rather than a
single column.

## Walkthrough

1. The page is a CSS grid with named columns — `content` (the 38rem text
   measure), `wide` (56rem) and `full` (edge to edge) — generated from one
   configuration (`layoutCss` in `src/domain/02-layout.ts`,
   `DEFAULT_LAYOUT`). Chapters use `subgrid`, so a figure inside a chapter can
   still leave the text column.
2. Figures pick a column by kind: maps and photos go `wide`, charts and
   diagrams stay with the text. An illustration can override it with
   `layout: inline | wide | full` in the chapter's front matter.
3. Headings scale fluidly with `clamp()` from the base size and heading ratio;
   the first chapter opens with a drop cap.
4. The header shows the reading time, counted from the chapters' prose only
   (`countWords` skips front matter, code, imports and tags) at 230 words a
   minute.
5. The CSS is inlined in the page's `<head>` at build time. An invalid
   configuration stops the build with the reason.

## Edge cases covered

| Case | Where it's handled |
|---|---|
| Reduced motion | The only motion, smooth scrolling to anchors, is emitted inside `@media (prefers-reduced-motion: no-preference)`; a test checks nothing moves outside it |
| No JavaScript | The layout is CSS only; the build check still rejects any `<script>` |
| Narrow screen | The side columns collapse to the gutter, so text and figures share one column; headings shrink with the viewport |
| Long chapter | Reading time grows with the text; the measure keeps lines readable |
| Missing asset | Unchanged: the build check rejects images that are not in the output |

## Automated coverage

- `test/domain/02-layout.test.ts` — the contract (T4).
- `test/integration/02-layout.test.ts` — the built story page: layout CSS in
  the head, motion only behind the preference, wide maps, reading time; an
  invalid configuration and a long chapter (T5–T6).
