import type { APIRoute } from 'astro';
import { siteConfig, withBase } from '@/data/site';

export const GET: APIRoute = () => {
  const sitemapUrl = new URL(withBase('/sitemap-index.xml'), siteConfig.url).toString();
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
