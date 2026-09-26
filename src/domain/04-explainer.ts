import { z } from "zod";

/** One state of a step-through explainer: an image and what changed. */
export interface ExplainerStep {
  id: string;
  label: string;
  src: string;
  alt: string;
  caption: string;
}

/**
 * A step-through explanation: the reader switches between states of one
 * picture. Built on radio inputs, so it works with the keyboard and without
 * JavaScript.
 */
export interface Explainer {
  id: string;
  title: string;
  steps: ExplainerStep[];
  /** Step shown first; defaults to the first step. */
  initial: string;
}

export type ExplainerError =
  | { kind: "invalid-explainer"; issues: string[] }
  | { kind: "missing-asset"; explainer: string; src: string[] };

export type ExplainerResult<T> = { ok: true; value: T } | { ok: false; error: ExplainerError };

const id = z.string().regex(/^[a-z0-9-]+$/, "ids must be lowercase kebab-case");

const stepSchema = z.object({
  id,
  label: z.string().min(1).max(24, "step labels must fit a button"),
  src: z.string().startsWith("/"),
  alt: z.string().min(1),
  caption: z.string().min(1),
});

export const explainerSchema = z
  .object({
    id,
    title: z.string().min(1),
    steps: z.array(stepSchema).min(2, "an explainer needs at least two steps").max(8, "more than eight steps is a slideshow"),
    initial: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const ids = value.steps.map((step) => step.id);
    const duplicate = ids.find((stepId, i) => ids.indexOf(stepId) !== i);
    if (duplicate) ctx.addIssue({ code: "custom", path: ["steps"], message: `duplicate step id "${duplicate}"` });
    if (value.initial && !ids.includes(value.initial)) {
      ctx.addIssue({ code: "custom", path: ["initial"], message: `initial step "${value.initial}" is not one of the steps` });
    }
  });

export function parseExplainer(input: unknown): ExplainerResult<Explainer> {
  const parsed = explainerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        kind: "invalid-explainer",
        issues: parsed.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`),
      },
    };
  }
  const { initial, ...rest } = parsed.data;
  return { ok: true, value: { ...rest, initial: initial ?? rest.steps[0]!.id } };
}

/** Every step's image must exist; the caller says how to check (the file system at build time). */
export function checkAssets(explainer: Explainer, exists: (src: string) => boolean): ExplainerResult<Explainer> {
  const missing = explainer.steps.map((step) => step.src).filter((src) => !exists(src));
  if (missing.length > 0) return { ok: false, error: { kind: "missing-asset", explainer: explainer.id, src: missing } };
  return { ok: true, value: explainer };
}

/** DOM ids for one explainer instance; the prefix keeps two explainers on a page apart. */
export function stepInputId(explainerId: string, stepId: string): string {
  return `explainer-${explainerId}-${stepId}`;
}

/**
 * CSS that shows the panel of the checked step. Every panel is visible by
 * default, so if this CSS never arrives the reader still sees all states in
 * order rather than none.
 */
export function explainerCss(explainer: Explainer): string {
  const root = `[data-explainer="${explainer.id}"]`;
  const rules = [`${root}:has(input:checked) .explainer-panel {\n  display: none;\n}`];
  for (const step of explainer.steps) {
    rules.push(
      `${root}:has(#${stepInputId(explainer.id, step.id)}:checked) .explainer-panel[data-step="${step.id}"] {\n  display: block;\n}`,
    );
  }
  return `${rules.join("\n\n")}\n`;
}
