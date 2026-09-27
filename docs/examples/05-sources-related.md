# Example: sources and related stories

The fifth scenario: check where a story's facts come from, then find the next
story to read.

## Walkthrough

1. Open *The Sea That Moved Away* and scroll to the end. **Sources** lists
   every work the story cites, once each, numbered in the order it is first
   cited. Under each work: what it supports, and a link to the chapter that
   cites it. NASA's *World of Change* is cited in chapters 2 and 3 and appears
   once, with both chapters under it.
2. Below it, **Related stories** offers *The Lake That Breathes* — another
   story about a shrinking lake — with the topics the two share: *water,
   shrinking lakes*. The Lake Chad story links back the same way.
3. Everything is plain links, so it works with JavaScript off and with any
   motion setting.

A story's topics are in its `story.json`:

```json
{ "title": "The Lake That Breathes", "topics": ["water", "shrinking-lakes", "sahel"] }
```

Related stories are other **published** stories with at least one topic in
common — most shared topics first, then the newest, at most three
(`relatedStories` in `src/domain/05-sources.ts`). A scheduled story never
appears before its date.

## Edge cases covered

| Case | Where it's handled |
|---|---|
| The same work cited in several chapters | One entry — matched by URL (ignoring `#…` and a trailing `/`), or by source name when there is no URL |
| A citation id used twice | The build stops: ids are footnote anchors (`duplicate-citation`, with both chapters) |
| A `javascript:` or other non-web link | The build stops (`unsafe-url`) |
| A topic like `Shrinking Lakes` | The build stops; topics are kebab-case (`invalid-topic`, with the story) |
| No shared topics, or only one story | *No other stories on these topics yet.* |
| Narrow screen | Related stories stack in one column; long source titles break instead of widening the page |
| No JavaScript / reduced motion | Links only; nothing animates |

`test/integration/05-sources.test.ts` checks this on the built pages.
