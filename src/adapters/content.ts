import { getCollection } from 'astro:content';
import type { Story } from '../domain/01-content-schema';
import { composeStories, describeError, publishedStories } from '../features/01-publication';

/**
 * Loads every story at build time. Broken content stops the build with a
 * message naming the story, instead of shipping a page with holes in it.
 */
export async function loadPublishedStories(now = new Date()): Promise<Story[]> {
  const [stories, chapters] = await Promise.all([getCollection('stories'), getCollection('chapters')]);
  const catalogue = composeStories(stories, chapters);
  if (catalogue.errors.length > 0) {
    throw new Error(`Content errors:\n${catalogue.errors.map(describeError).join('\n')}`);
  }
  return publishedStories(catalogue.stories, now);
}
