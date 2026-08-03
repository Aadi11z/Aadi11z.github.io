const defaultSiteUrl = 'https://aadi11z.github.io';

export const introStorageKey = 'aaditya-portfolio-intro-v1';

export const siteConfig = {
  url: (import.meta.env.PUBLIC_SITE_URL ?? defaultSiteUrl).replace(/\/$/, ''),
  basePath: import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, ''),
} as const;

export function withBase(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.basePath}${normalizedPath}` || '/';
}
