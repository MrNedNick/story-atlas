import type { Story } from '../domain/01-content-schema';
import { collectSources, relatedStories, type RelatedStory, type SourceEntry, type SourcesError } from '../domain/05-sources';

function describe(slug: string, error: SourcesError): string {
  switch (error.kind) {
    case 'duplicate-citation':
      return `Story "${slug}": citation id "${error.citationId}" is used in ${error.chapters.join(' and ')}; citation ids are footnote anchors and must be unique in a story.`;
    case 'unsafe-url':
      return `Story "${slug}": citation "${error.citationId}" links to ${error.url}; only http and https links are allowed.`;
    case 'invalid-topic':
      return `Story "${error.slug}": topic "${error.topic}" must be kebab-case, like "shrinking-lakes".`;
  }
}

/** The story's numbered source list; a broken citation stops the build with the story named. */
export function storySources(story: Story): SourceEntry[] {
  const result = collectSources(
    story.chapters.map((chapter) => ({ chapterId: chapter.id, order: chapter.order, title: chapter.title, citations: chapter.citations })),
  );
  if (!result.ok) throw new Error(describe(story.slug, result.error));
  return result.value;
}

/** Other published stories on the same topics, best match first. */
export function storyRelated(story: Story, published: Story[], now = new Date()): RelatedStory[] {
  const card = ({ slug, title, dek, publishedAt, topics }: Story) => ({ slug, title, dek, publishedAt, topics });
  const result = relatedStories(card(story), published.map(card), now);
  if (!result.ok) throw new Error(describe(story.slug, result.error));
  return result.value;
}
