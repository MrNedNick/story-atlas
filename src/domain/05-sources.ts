import type { Citation } from "./01-content-schema";

/** A chapter's citations as the story page has them: in chapter order. */
export interface ChapterCitations {
  chapterId: string;
  order: number;
  title: string;
  citations: Citation[];
}

/** One entry in a story's source list: a work cited once or more, with every place it is cited from. */
export interface SourceEntry {
  /** 1-based, in order of first citation. */
  number: number;
  /** Anchor for the entry in the story's source list. */
  anchor: string;
  source: string;
  url?: string;
  citedIn: { chapterId: string; chapterTitle: string; citationId: string; text: string }[];
}

/** A published story as the related-stories list sees it. */
export interface StoryCard {
  slug: string;
  title: string;
  dek: string;
  publishedAt: Date;
  topics: string[];
}

export interface RelatedStory {
  slug: string;
  title: string;
  dek: string;
  sharedTopics: string[];
}

export type SourcesError =
  | { kind: "duplicate-citation"; citationId: string; chapters: string[] }
  | { kind: "unsafe-url"; citationId: string; url: string }
  | { kind: "invalid-topic"; slug: string; topic: string };

export type SourcesResult<T> = { ok: true; value: T } | { ok: false; error: SourcesError };

const SAFE_PROTOCOLS = new Set(["http:", "https:"]);
const TOPIC = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Same work: the same URL (ignoring a trailing slash and fragment), or the same source name when there is none. */
function workKey(citation: Citation): string {
  if (!citation.url) return `source:${citation.source.trim().toLowerCase()}`;
  const url = new URL(citation.url);
  url.hash = "";
  return `url:${url.href.replace(/\/$/, "")}`;
}

/**
 * The story's source list: each work once, numbered by first citation, pointing back to every
 * chapter that cites it. Citation ids are the chapters' footnote anchors, so they must be unique
 * across the whole story; links must be plain web links.
 */
export function collectSources(chapters: ChapterCitations[]): SourcesResult<SourceEntry[]> {
  const seen = new Map<string, string>();
  for (const chapter of [...chapters].sort((a, b) => a.order - b.order)) {
    for (const citation of chapter.citations) {
      const first = seen.get(citation.id);
      if (first) return { ok: false, error: { kind: "duplicate-citation", citationId: citation.id, chapters: [first, chapter.chapterId] } };
      seen.set(citation.id, chapter.chapterId);
      if (citation.url && !SAFE_PROTOCOLS.has(new URL(citation.url).protocol)) {
        return { ok: false, error: { kind: "unsafe-url", citationId: citation.id, url: citation.url } };
      }
    }
  }

  const entries = new Map<string, SourceEntry>();
  for (const chapter of [...chapters].sort((a, b) => a.order - b.order)) {
    for (const citation of chapter.citations) {
      const key = workKey(citation);
      let entry = entries.get(key);
      if (!entry) {
        const number = entries.size + 1;
        entry = { number, anchor: `source-${number}`, source: citation.source, ...(citation.url ? { url: citation.url } : {}), citedIn: [] };
        entries.set(key, entry);
      }
      entry.citedIn.push({ chapterId: chapter.chapterId, chapterTitle: chapter.title, citationId: citation.id, text: citation.text });
    }
  }
  return { ok: true, value: [...entries.values()] };
}

/**
 * Up to `limit` other published stories that share a topic with this one: most shared topics
 * first, then the newest. A story with no topics, or with nothing in common, gets an empty list.
 */
export function relatedStories(current: StoryCard, all: StoryCard[], now: Date, limit = 3): SourcesResult<RelatedStory[]> {
  for (const story of [current, ...all]) {
    const bad = story.topics.find((topic) => !TOPIC.test(topic));
    if (bad !== undefined) return { ok: false, error: { kind: "invalid-topic", slug: story.slug, topic: bad } };
  }
  const mine = new Set(current.topics);
  const ranked = all
    .filter((story) => story.slug !== current.slug && story.publishedAt.getTime() <= now.getTime())
    .map((story) => ({ story, shared: story.topics.filter((topic) => mine.has(topic)) }))
    .filter(({ shared }) => shared.length > 0)
    .sort((a, b) => b.shared.length - a.shared.length || b.story.publishedAt.getTime() - a.story.publishedAt.getTime());
  return {
    ok: true,
    value: ranked.slice(0, limit).map(({ story, shared }) => ({ slug: story.slug, title: story.title, dek: story.dek, sharedTopics: shared })),
  };
}
