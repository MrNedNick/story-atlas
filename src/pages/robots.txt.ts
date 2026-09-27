import { buildRobots } from '../domain/06-distribution';
import { siteConfig } from '../features/06-distribution';

export function GET() {
  return new Response(buildRobots(siteConfig()), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
