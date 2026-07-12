import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const base = (process.env.PUBLIC_BASE_PATH ?? '').replace(/^\/+|\/+$/g, '');
const basePrefix = base ? `/${base}` : '';

const required = [
  'index.html',
  '404.html',
  'projects/index.html',
  'projects/grounddesk/index.html',
  'projects/nrg/index.html',
  'projects/mlp-trainer-agentic-tutor/index.html',
  'projects/machine-unlearning-vision-language-models/index.html',
  'resume/index.html',
  'Aaditya_Bhatnagar_Resume.pdf',
  'favicon.svg',
  'og-image.svg',
  'manifest.webmanifest',
  'robots.txt',
  'sitemap-index.xml',
];

for (const file of required) {
  if (!existsSync(join(dist, file))) throw new Error(`Missing generated artifact: ${file}`);
}

/** @type {string[]} */
const htmlFiles = [];
/** @param {string} directory */
function collect(directory) {
  for (const entry of readdirSync(directory)) {
    const file = join(directory, entry);
    if (statSync(file).isDirectory()) collect(file);
    else if (file.endsWith('.html')) htmlFiles.push(file);
  }
}
collect(dist);

const internalLinks = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  if ((html.match(/<h1\b/g) ?? []).length !== 1) throw new Error(`Expected exactly one h1 in ${file}`);
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate id in ${file}`);
  for (const labelledBy of html.matchAll(/aria-labelledby=["']([^"']+)["']/g)) {
    for (const id of labelledBy[1].split(/\s+/)) if (!ids.includes(id)) throw new Error(`Missing aria-labelledby target ${id} in ${file}`);
  }
  if (!html.includes('id="main-content"') || !html.includes('href="#main-content"')) throw new Error(`Skip link target missing in ${file}`);
  if (/href=["']\s*["']/.test(html) || /href=["']#["']/.test(html)) throw new Error(`Empty or placeholder href in ${file}`);
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const value = match[1];
    if (value.startsWith('/') && !value.startsWith('//')) internalLinks.push(value);
  }
  for (const match of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
    if (!/rel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i.test(match[0])) throw new Error(`Unsafe external link in ${file}`);
  }
  if (html.includes('+971') || html.includes('509342511')) throw new Error(`Phone number leaked into generated HTML: ${file}`);
}

for (const link of internalLinks) {
  const path = link.split(/[?#]/)[0];
  if (!path.startsWith(basePrefix)) throw new Error(`Internal link does not respect base path: ${link}`);
  const relativePath = (path.slice(basePrefix.length) || '/').replace(/^\//, '');
  const candidates = relativePath.endsWith('/')
    ? [join(dist, relativePath, 'index.html')]
    : [join(dist, relativePath), join(dist, `${relativePath}.html`), join(dist, relativePath, 'index.html')];
  if (!candidates.some(existsSync)) throw new Error(`Broken generated link: ${link}`);
}

const notFoundHtml = readFileSync(join(dist, '404.html'), 'utf8');
if (!/name="robots" content="noindex, nofollow"/.test(notFoundHtml)) throw new Error('404 page must be noindex');

const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
const expectedSitemap = `${process.env.PUBLIC_SITE_URL ?? 'https://aadi11z.github.io'}${basePrefix}/sitemap-index.xml`;
if (!robots.includes(expectedSitemap)) throw new Error(`Robots sitemap mismatch: expected ${expectedSitemap}`);

console.log(`Generated-output checks passed: ${htmlFiles.length} HTML pages and ${internalLinks.length} internal references verified.`);
