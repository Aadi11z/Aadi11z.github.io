import type { APIRoute } from 'astro';
import { siteConfig, withBase } from '@/data/site';

export const GET: APIRoute = () => {
  const manifest = {
    name: 'Aaditya Bhatnagar — Portfolio',
    short_name: 'Aaditya Bhatnagar',
    description: 'Portfolio of Aaditya Bhatnagar, ML Engineer and Data Scientist.',
    start_url: withBase('/'),
    scope: withBase('/'),
    display: 'standalone',
    background_color: '#efe8d1',
    theme_color: '#254c8b',
    icons: [{ src: withBase('/favicon.svg'), sizes: 'any', type: 'image/svg+xml' }],
    id: new URL(withBase('/'), siteConfig.url).toString(),
  };
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
