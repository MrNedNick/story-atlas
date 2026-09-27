import { loadPublishedStories } from '../adapters/content';
import { buildRss } from '../domain/06-distribution';
import { siteConfig } from '../features/06-distribution';

export async function GET() {
  const stories = await loadPublishedStories();
  return new Response(buildRss(siteConfig(), stories), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
