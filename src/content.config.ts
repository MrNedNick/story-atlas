import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { chapterFrontmatterSchema, storyMetaSchema } from './domain/01-content-schema';

const base = './src/content/stories';

/** One folder per story: `<slug>/story.json` holds the metadata. */
const stories = defineCollection({
  loader: glob({ pattern: '*/story.json', base, generateId: ({ entry }) => entry.split('/')[0] ?? entry }),
  schema: storyMetaSchema,
});

/** Chapters are the numbered MDX files next to `story.json`; their id is `<slug>/<file name>`. */
const chapters = defineCollection({
  loader: glob({ pattern: '*/[0-9]*.mdx', base }),
  schema: chapterFrontmatterSchema,
});

export const collections = { stories, chapters };
