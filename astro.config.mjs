// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

// SITE_URL and BASE_PATH say where the built site will be served: a domain root by default,
// or a project page such as https://mrnednick.github.io/story-atlas/.
// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  integrations: [mdx()]
});
