import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, inject, it } from 'vitest';
import { publicAssetExists } from '../../src/adapters/assets';
import { prepareExplainer } from '../../src/features/04-explainer';

const dist = inject('distDir');
const story = readFileSync(join(dist, 'stories', 'aral-sea', 'index.html'), 'utf8');
// Scoped-style attributes that Astro adds are not part of what is being checked.
const figure = story
  .slice(story.indexOf('<figure class="explainer"'), story.indexOf('</figure>', story.indexOf('<figure class="explainer"')))
  .replace(/ data-astro-cid-\w+/g, '');
const css = [...story.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(([, text]) => text).join('\n');
const explainerCss = css
  .split('}')
  .filter((rule) => rule.includes('explainer'))
  .join('}');

const data = JSON.parse(readFileSync('src/content/explainers/aral-shoreline.json', 'utf8'));

describe('step-through explainer on the built story page (end to end)', () => {
  it('is a labelled group of radio buttons with one panel per step, and no script', () => {
    expect(figure).toContain('<legend>The shoreline over time</legend>');
    const radios = [...figure.matchAll(/<input type="radio" name="explainer-aral-shoreline" id="([^"]+)"( checked)?/g)];
    expect(radios.map(([, id]) => id)).toEqual([
      'explainer-aral-shoreline-1960',
      'explainer-aral-shoreline-late-1980s',
      'explainer-aral-shoreline-2014',
    ]);
    expect(radios.filter(([, , checked]) => checked)).toHaveLength(1);
    expect(figure.match(/class="explainer-panel"/g)).toHaveLength(3);
    expect(story).not.toMatch(/<script\b/);
  });

  it('switches panels with CSS alone, and shows every step where :has() is not supported', () => {
    for (const step of ['1960', 'late-1980s', '2014']) {
      expect(css).toContain(`:has(#explainer-aral-shoreline-${step}:checked) .explainer-panel[data-step="${step}"]`);
    }
    // Hiding is only ever done inside a :has() rule, so an older browser falls back to all steps in order.
    const hiding = explainerCss.split('}').filter((rule) => /display:\s*none/.test(rule) && rule.includes('explainer-panel'));
    expect(hiding.length).toBeGreaterThan(0);
    expect(hiding.every((rule) => rule.includes(':has('))).toBe(true);
  });

  it('ships every step image with alt text, and wraps the step buttons on a narrow screen', () => {
    for (const [, src, alt] of figure.matchAll(/<img src="([^"]+)" alt="([^"]*)"/g)) {
      expect(existsSync(join(dist, src!))).toBe(true);
      expect(alt!.length).toBeGreaterThan(10);
    }
    expect(explainerCss).toMatch(/\.explainer-options[^{]*\{[^}]*flex-wrap:\s*wrap/);
  });

  it('does not animate the switch for anyone who asked for reduced motion', () => {
    const outside = explainerCss.replace(/@media \(prefers-reduced-motion: no-preference\)[\s\S]*?\}\s*\}/g, '');
    expect(outside).not.toMatch(/transition|animation/);
  });
});

describe('explainer edge cases', () => {
  it('stops the build when a step image is missing, naming the explainer and the file', () => {
    const exists = (src: string) => !src.endsWith('2014.svg') && publicAssetExists(src);
    expect(() => prepareExplainer({ ...data, id: 'aral-shoreline' }, exists)).toThrow(/missing-asset[\s\S]*aral-shoreline[\s\S]*2014\.svg/);
  });

  it('finds the real images in public/', () => {
    expect(data.steps.every((step: { src: string }) => publicAssetExists(step.src))).toBe(true);
    expect(publicAssetExists('/stories/aral-sea/nope.svg')).toBe(false);
  });
});
