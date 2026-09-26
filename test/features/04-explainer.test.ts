import { describe, expect, it } from 'vitest';
import { prepareExplainer } from '../../src/features/04-explainer';
import { publicAssetExists } from '../../src/adapters/assets';
import { shorelineExplainer } from '../fixtures/04-explainer-fixtures';

describe('prepareExplainer', () => {
  it('returns the explainer with its CSS when every image exists', () => {
    const { explainer, css } = prepareExplainer(shorelineExplainer, () => true);
    expect(explainer.initial).toBe('1960');
    expect(css).toContain('data-step="2014"');
  });

  it('stops the build on a missing image, naming the explainer and the file', () => {
    expect(() => prepareExplainer(shorelineExplainer, (src) => !src.endsWith('step-2014.svg'))).toThrow(
      /missing-asset.*aral-shoreline.*step-2014\.svg/,
    );
  });

  it('stops the build on an invalid explainer', () => {
    expect(() => prepareExplainer({ ...shorelineExplainer, steps: [] }, () => true)).toThrow(/invalid-explainer/);
  });
});

describe('publicAssetExists', () => {
  it('looks the path up in public/', () => {
    expect(publicAssetExists('/stories/aral-sea/2014.svg')).toBe(true);
    expect(publicAssetExists('/stories/aral-sea/nope.svg')).toBe(false);
  });
});
