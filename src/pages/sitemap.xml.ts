import { loadPublishedStories } from '../adapters/content';
import { buildSitemap } from '../domain/06-distribution';
import { siteConfig } from '../features/06-distribution';

export async function GET() {
  const stories = await loadPublishedStories();
  return new Response(buildSitemap(siteConfig(), stories), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
