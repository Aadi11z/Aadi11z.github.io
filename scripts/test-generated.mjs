import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const base = (process.env.PUBLIC_BASE_PATH ?? '').replace(/^\/+|\/+$/g, '');
const basePrefix = base ? `/${base}` : '';

const required = [
  'index.html',
  '404.html',
  'lab/index.html',
  'projects/index.html',
  'projects/grounddesk/index.html',
  'projects/nrg/index.html',
  'projects/mlp-trainer-agentic-tutor/index.html',
  'projects/machine-unlearning-vision-language-models/index.html',
  'resume/index.html',
  'Aaditya_Bhatnagar_Resume.pdf',
  'favicon.svg',
  'og-image.svg',
  'og-image.png',
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
  if ((html.match(/<main\b/g) ?? []).length !== 1) throw new Error(`Expected exactly one main landmark in ${file}`);
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate id in ${file}`);
  for (const reference of html.matchAll(/aria-(?:labelledby|describedby|controls)=["']([^"']+)["']/g)) {
    for (const id of reference[1].split(/\s+/)) if (!ids.includes(id)) throw new Error(`Missing ARIA target ${id} in ${file}`);
  }
  if (!html.includes('id="main-content"') || !html.includes('href="#main-content"')) throw new Error(`Skip link target missing in ${file}`);
  if (!html.includes('data-theme-toggle') || !html.includes('data-motion-control')) throw new Error(`Display preferences missing in ${file}`);
  if (/href=["']\s*["']/.test(html) || /href=["']#["']/.test(html)) throw new Error(`Empty or placeholder href in ${file}`);

  const requiredMetadata = [/<title>[^<]+<\/title>/, /<meta name="description"/, /<link rel="canonical"/, /<meta property="og:title"/, /<meta property="og:description"/, /<meta property="og:image"/, /<meta name="twitter:card"/];
  for (const pattern of requiredMetadata) if (!pattern.test(html)) throw new Error(`Metadata regression in ${file}: ${pattern}`);

  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch { throw new Error(`Invalid JSON-LD in ${file}`); }
  }

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

const archiveHtml = readFileSync(join(dist, 'projects/index.html'), 'utf8');
if ((archiveHtml.match(/data-filter=/g) ?? []).length < 8 || !archiveHtml.includes('data-project-card')) throw new Error('Project archive filters or cards are missing');

const homeHtml = readFileSync(join(dist, 'index.html'), 'utf8');
const expectedIntroMode = process.env.PUBLIC_INTRO_MODE === 'design' ? 'design' : 'normal';
if (!homeHtml.includes('data-layout="deck"') || !homeHtml.includes('data-section-deck')) throw new Error('Homepage section deck is missing');
for (const section of ['overview', 'work', 'research', 'experience', 'about', 'contact']) {
  if (!homeHtml.includes(`id="${section}"`) || !homeHtml.includes(`data-section-link="${section}"`)) {
    throw new Error(`Homepage deck section or navigation link is missing: ${section}`);
  }
}
if ((homeHtml.match(/<(?:div|section)\b[^>]*\bdata-deck-panel\b/g) ?? []).length !== 6) throw new Error('Homepage must render exactly six section panels');
if (!homeHtml.includes('data-typing-station') || !homeHtml.includes('data-typed-name') || !homeHtml.includes('keyboard-chassis') || !homeHtml.includes('data-typing-enter')) {
  throw new Error('Accessible hero typing station is missing');
}
if (!homeHtml.includes('data-hero-gate') || !homeHtml.includes('data-overview-content')) throw new Error('Hero intro gate or Overview fallback is missing');
if (!homeHtml.includes('data-intro-storage-key="aaditya-portfolio-intro-v1"') || !homeHtml.includes(`data-intro-mode="${expectedIntroMode}"`) || !homeHtml.includes("dataset.introVisit")) {
  throw new Error('Generated homepage is missing first-visit intro initialization.');
}

for (const explorerPage of ['lab/index.html', 'projects/machine-unlearning-vision-language-models/index.html']) {
  const html = readFileSync(join(dist, explorerPage), 'utf8');
  if (!html.includes('data-unlearning-explorer') || !html.includes('<noscript>') || !html.includes('Measured points only')) {
    throw new Error(`Explorer fallback content is missing in ${explorerPage}`);
  }
}

const notFoundHtml = readFileSync(join(dist, '404.html'), 'utf8');
if (!/name="robots" content="noindex, nofollow"/.test(notFoundHtml)) throw new Error('404 page must be noindex');

const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
const expectedSitemap = `${process.env.PUBLIC_SITE_URL ?? 'https://aadi11z.github.io'}${basePrefix}/sitemap-index.xml`;
if (!robots.includes(expectedSitemap)) throw new Error(`Robots sitemap mismatch: expected ${expectedSitemap}`);

const sitemap = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
if (!sitemap.includes(`${basePrefix}/lab/`)) throw new Error('Lab route is missing from the sitemap');

console.log(`Generated-output checks passed: ${htmlFiles.length} HTML pages and ${internalLinks.length} internal references verified.`);
