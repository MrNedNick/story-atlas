# Example: chapters and navigation

The third scenario: find your way around a story without scrolling blind.

## Walkthrough

1. Every story page opens with **Contents**: one link per chapter with its
   reading time (`storyToc` in `src/features/03-navigation.ts`).
2. Chapters get stable anchors built from their number and title —
   `#chapter-2-rivers-turned-to-fields` — so links can be shared and two
   chapters with the same title never collide (`chapterAnchor`). Titles in
   any script work: letters and digits are kept as they are.
3. A chapter that takes five minutes or more to read also lists its own
   `###` sections in the contents, taken from the headings MDX renders.
4. Each chapter ends with links to the previous and next chapter and back to
   the contents (`rel="prev"` / `rel="next"`).
5. It is all plain links: nothing runs in the browser.

## Edge cases covered

| Case | Where it's handled |
|---|---|
| Long chapter | Its sections appear in the contents; anchored headings keep a little room above them (`scroll-margin-top`) |
| No JavaScript | Plain `<a href="#…">` links; the build check rejects scripts |
| Broken in-page link | `scripts/check-dist.mjs` fails the build if a `href="#…"` has no matching `id` on the page |
| Reduced motion | Jumps are instant unless the reader allows motion (smooth scrolling lives behind the preference) |
| Narrow screen | The chapter links wrap onto two rows; contents stay in the text column |
| Duplicate chapter numbers or blank titles | The build stops and names the story |

## Automated coverage

- `test/domain/03-navigation.test.ts` — the contract (T7).
- `test/features/03-navigation.test.ts` — contents from rendered chapters (T8).
- `test/integration/03-navigation.test.ts` — the built page: contents, chapter
  anchors, previous/next links, no scripts; a broken anchor the check must
  reject (T9).
