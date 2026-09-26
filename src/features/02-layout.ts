import type { Illustration } from '../domain/01-content-schema';
import {
  type FigureLayout,
  type LayoutConfig,
  DEFAULT_LAYOUT,
  countWords,
  createLayoutConfig,
  layoutCss,
  readingMinutes,
  resolveFigureLayout,
} from '../domain/02-layout';

/** The site's layout as CSS; an invalid configuration stops the build with the reason. */
export function siteLayoutCss(config: LayoutConfig = DEFAULT_LAYOUT): string {
  const result = createLayoutConfig(config);
  if (!result.ok) throw new Error(`Invalid layout configuration: ${JSON.stringify(result.error)}`);
  return layoutCss(result.value);
}

/** Reading time of a whole story from the raw MDX of its chapters. */
export function storyReadingMinutes(chapterBodies: string[]): number {
  return readingMinutes(chapterBodies.reduce((total, body) => total + countWords(body), 0));
}

export function figureLayout(illustration: Illustration): FigureLayout {
  return resolveFigureLayout(illustration);
}
