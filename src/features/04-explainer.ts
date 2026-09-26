import { type Explainer, checkAssets, explainerCss, parseExplainer } from '../domain/04-explainer';

export interface PreparedExplainer {
  explainer: Explainer;
  css: string;
}

/** Validates an explainer and its images for the page; anything wrong stops the build with the reason. */
export function prepareExplainer(data: unknown, exists: (src: string) => boolean): PreparedExplainer {
  const parsed = parseExplainer(data);
  if (!parsed.ok) throw new Error(`Explainer: ${JSON.stringify(parsed.error)}`);
  const checked = checkAssets(parsed.value, exists);
  if (!checked.ok) throw new Error(`Explainer: ${JSON.stringify(checked.error)}`);
  return { explainer: checked.value, css: explainerCss(checked.value) };
}
