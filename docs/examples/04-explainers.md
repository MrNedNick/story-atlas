# Example: a step-through explainer

The fourth scenario: follow a change over time by stepping through the same
picture, without any JavaScript on the page.

## Walkthrough

1. Open the Aral Sea story and go to chapter 3, *Two different endings*.
   Above the wide map sits **The shoreline over time** with three steps:
   **1960**, **Late 1980s**, **2014**.
2. Click a step, or Tab into the group and use the arrow keys. The map and its
   caption change to that year; exactly one panel is shown at a time.
3. Reload: the explainer opens on its starting step again. Nothing is stored —
   it is a group of radio buttons, and the browser's own form handling does the
   work.

An explainer is a JSON file in `src/content/explainers/` — a title and two to
eight steps, each with a short label, an image in `public/`, alt text and a
caption. A chapter places it with `<Explainer id="aral-shoreline" />`.

## How it works without JavaScript

The steps are real `<input type="radio">` elements in a `<fieldset>` with a
`<legend>`, so keyboard and screen-reader behaviour comes from the browser.
The CSS generated for each explainer (`explainerCss` in
`src/domain/04-explainer.ts`) shows the panel whose radio is checked:

```css
[data-explainer="aral-shoreline"]:has(#explainer-aral-shoreline-2014:checked)
  .explainer-panel[data-step="2014"] { display: block; }
```

Panels are only ever hidden inside a `:has()` rule, so a browser without
`:has()` shows every step one after another instead of hiding them all.

## Edge cases covered

| Case | Where it's handled |
|---|---|
| No JavaScript | Radio buttons and CSS only; the build check rejects scripts |
| Reduced motion | Switching steps has no transition or animation at all |
| Narrow screen | The step buttons wrap onto a second line; the map scales to the column |
| Missing image | `prepareExplainer` stops the build with `missing-asset`, the explainer id and every missing file |
| Bad data | Fewer than two steps, duplicate step ids or an unknown starting step fail the build with `invalid-explainer` |

`test/integration/04-explainer.test.ts` checks all of this on the built page.
