import { z } from "zod";

export type ContentSchemaError =
  | { kind: "invalid-citation"; issues: string[] }
  | { kind: "invalid-illustration"; issues: string[] }
  | { kind: "invalid-chapter"; issues: string[] }
  | { kind: "invalid-story"; issues: string[] };

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: ContentSchemaError };

export interface Citation {
  id: string;
  text: string;
  source: string;
  url?: string;
}

export interface Illustration {
  id: string;
  kind: "map" | "chart" | "photo" | "diagram";
  src: string;
  alt: string;
  caption?: string;
  /** Column the figure spans; defaults by kind (see 02-layout). */
  layout?: "inline" | "wide" | "full";
}

export interface Chapter {
  id: string;
  order: number;
  title: string;
  bodyRef: string;
  illustrations: Illustration[];
  citations: Citation[];
}

export interface Story {
  slug: string;
  title: string;
  dek: string;
  publishedAt: Date;
  updatedAt?: Date;
  /** Kebab-case subjects shared across stories; the basis for related stories. */
  topics: string[];
  chapters: Chapter[];
}

const citationSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  source: z.string().min(1),
  url: z.url().optional(),
});

const illustrationSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["map", "chart", "photo", "diagram"]),
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
  layout: z.enum(["inline", "wide", "full"]).optional(),
});

const chapterSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  bodyRef: z.string().min(1),
  illustrations: z.array(illustrationSchema).default([]),
  citations: z.array(citationSchema).default([]),
});

const storySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  title: z.string().min(1),
  dek: z.string().min(1),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  topics: z.array(z.string()).default([]),
  chapters: z.array(chapterSchema).min(1, "a story needs at least one chapter"),
});

/** Chapter front matter as written in an MDX file: the id and body come from the file itself. */
export const chapterFrontmatterSchema = chapterSchema.omit({ id: true, bodyRef: true });

/** Story metadata as written in `story.json`: the slug is the folder name, chapters are the MDX files beside it. */
export const storyMetaSchema = storySchema.omit({ slug: true, chapters: true });

function issuesFrom(error: z.ZodError): string[] {
  return error.issues.map(
    (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
  );
}

export function parseCitation(input: unknown): Result<Citation> {
  const parsed = citationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { kind: "invalid-citation", issues: issuesFrom(parsed.error) } };
  }
  return { ok: true, value: parsed.data };
}

export function parseIllustration(input: unknown): Result<Illustration> {
  const parsed = illustrationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { kind: "invalid-illustration", issues: issuesFrom(parsed.error) } };
  }
  return { ok: true, value: parsed.data };
}

export function parseChapter(input: unknown): Result<Chapter> {
  const parsed = chapterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { kind: "invalid-chapter", issues: issuesFrom(parsed.error) } };
  }
  return { ok: true, value: parsed.data };
}

export function parseStory(input: unknown): Result<Story> {
  const parsed = storySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { kind: "invalid-story", issues: issuesFrom(parsed.error) } };
  }
  return { ok: true, value: parsed.data };
}

export function sortChaptersByOrder(chapters: Chapter[]): Chapter[] {
  return [...chapters].sort((a, b) => a.order - b.order);
}

export function isPublishable(story: Story, now: Date = new Date()): boolean {
  return story.chapters.length > 0 && story.publishedAt.getTime() <= now.getTime();
}
