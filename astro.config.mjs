import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const site = (process.env.PUBLIC_SITE_URL ?? 'https://aadi11z.github.io').replace(/\/$/, '');
const rawBase = process.env.PUBLIC_BASE_PATH?.trim() ?? '';
const base = rawBase ? `/${rawBase.replace(/^\/+|\/+$/g, '')}` : undefined;

export default defineConfig({
  site,
  base,
  integrations: [sitemap()],
  build: { format: 'directory' },
});
