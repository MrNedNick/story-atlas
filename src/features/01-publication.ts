import {
  type ContentSchemaError,
  type Story,
  isPublishable,
  parseStory,
  sortChaptersByOrder,
} from '../domain/01-content-schema';

/** A content entry as the collection loader hands it over. */
export interface Entry {
  id: string;
  data: Record<string, unknown>;
}

export type PublicationError =
  | { kind: 'content'; slug: string; error: ContentSchemaError }
  | { kind: 'orphan-chapter'; chapterId: string };

export interface Catalogue {
  stories: Story[];
  errors: PublicationError[];
}

function storySlugOf(chapterId: string): string {
  return chapterId.split('/')[0] ?? chapterId;
}

/**
 * Builds domain stories from the two collections: each `story.json` with the
 * chapters in its folder. Every story is validated against the full contract,
 * so a folder with metadata but no chapters is an error, not an empty page.
 */
export function composeStories(storyEntries: Entry[], chapterEntries: Entry[]): Catalogue {
  const slugs = new Set(storyEntries.map((entry) => entry.id));
  const errors: PublicationError[] = chapterEntries
    .filter((chapter) => !slugs.has(storySlugOf(chapter.id)))
    .map((chapter) => ({ kind: 'orphan-chapter', chapterId: chapter.id }));

  const stories: Story[] = [];
  for (const entry of storyEntries) {
    const chapters = chapterEntries
      .filter((chapter) => storySlugOf(chapter.id) === entry.id)
      .map((chapter) => ({ ...chapter.data, id: chapter.id, bodyRef: chapter.id }));
    const story = parseStory({ ...entry.data, slug: entry.id, chapters });
    if (story.ok) stories.push({ ...story.value, chapters: sortChaptersByOrder(story.value.chapters) });
    else errors.push({ kind: 'content', slug: entry.id, error: story.error });
  }
  return { stories, errors };
}

/** Stories a reader can see at `now`, newest first. Scheduled stories stay out of the site. */
export function publishedStories(stories: Story[], now: Date): Story[] {
  return stories
    .filter((story) => isPublishable(story, now))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function describeError(error: PublicationError): string {
  if (error.kind === 'orphan-chapter') {
    return `Chapter "${error.chapterId}" has no story.json in its folder.`;
  }
  return `Story "${error.slug}": ${error.error.issues.join('; ')}`;
}
