import { DEFAULT_LAYOUT, type LayoutConfig } from "../../src/domain/02-layout";

export const narrowMeasure: LayoutConfig = { ...DEFAULT_LAYOUT, measureRem: 12 };
export const wideNotWider: LayoutConfig = { ...DEFAULT_LAYOUT, wideRem: 40 };
export const noGutter: LayoutConfig = { ...DEFAULT_LAYOUT, gutterRem: 0 };
export const hugeBase: LayoutConfig = { ...DEFAULT_LAYOUT, baseSizeRem: 3 };
export const flatHeadings: LayoutConfig = { ...DEFAULT_LAYOUT, headingRatio: 1 };
export const plainLayout: LayoutConfig = { ...DEFAULT_LAYOUT, dropCap: false, smoothScroll: false };

export const chapterMdx = `---
order: 1
title: 'A sea in the desert'
---

import Aside from '../../components/Aside.astro';

The Aral Sea sits in the desert between **Kazakhstan** and *Uzbekistan*.

<Aside>Not counted as markup, counted as words.</Aside>

\`\`\`js
const notProse = true;
\`\`\`

- It has no outlet — water leaves only by evaporation.
`;
