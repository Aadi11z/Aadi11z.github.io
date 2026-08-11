import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

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
  if (!html.includes('data-theme-toggle')) throw new Error(`Theme preference missing in ${file}`);
  if (html.includes('data-motion-control') || html.includes("localStorage.getItem('motion')") || html.includes('data-motion=')) throw new Error(`Retired motion preference found in ${file}`);
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
if (!archiveHtml.includes('data-project-card')) throw new Error('Project archive cards are missing');
for (const topic of ['ai', 'ml', 'software-dev', 'quant', 'data']) {
  if (!archiveHtml.includes(`id="${topic}"`)) throw new Error(`Project archive topic is missing: ${topic}`);
}

const homeHtml = readFileSync(join(dist, 'index.html'), 'utf8');
const expectedIntroMode = process.env.PUBLIC_INTRO_MODE === 'design' ? 'design' : 'normal';
if (!homeHtml.includes('data-layout="deck"') || !homeHtml.includes('data-section-deck')) throw new Error('Homepage section deck is missing');
for (const section of ['overview', 'projects', 'research', 'experience']) {
  if (!homeHtml.includes(`id="${section}"`) || !homeHtml.includes(`data-section-link="${section}"`)) {
    throw new Error(`Homepage deck section or navigation link is missing: ${section}`);
  }
}
if ((homeHtml.match(/<(?:div|section)\b[^>]*\bdata-deck-panel\b/g) ?? []).length !== 4) throw new Error('Homepage must render exactly four section panels');
for (const removedSection of ['work', 'about', 'contact']) {
  if (homeHtml.includes(`data-section-link="${removedSection}"`)) throw new Error(`Retired homepage navigation returned: ${removedSection}`);
}
if (!homeHtml.includes('class="overview-brief"') || !homeHtml.includes('class="overview-contact"')) throw new Error('About or contact content is missing from Overview');
if ((homeHtml.match(/class="research-card"/g) ?? []).length !== 2 || (homeHtml.match(/class="paper-card"/g) ?? []).length !== 2) {
  throw new Error('Research projects or paper references are missing from the homepage');
}
for (const cardHeading of ['project-title', 'research-card-title', 'paper-card-title']) {
  if (!homeHtml.includes(`<h4 class="${cardHeading}"`)) throw new Error(`Homepage card heading hierarchy regressed: ${cardHeading}`);
}
if (!homeHtml.includes('data-keyboard-intro') || !homeHtml.includes('data-typed-name') || !homeHtml.includes('data-keyboard') || !homeHtml.includes('data-intro-status')) {
  throw new Error('Accessible native keyboard intro is missing');
}
if (!homeHtml.includes('data-hero-gate') || !homeHtml.includes('data-overview-content')) throw new Error('Hero intro gate or Overview fallback is missing');
if (!homeHtml.includes('data-intro-session-key="aaditya-portfolio-intro-v2"') || !homeHtml.includes(`data-intro-mode="${expectedIntroMode}"`) || !homeHtml.includes("dataset.introVisit")) {
  throw new Error('Generated homepage is missing first-visit intro initialization.');
}

const introMarkup = homeHtml.match(/<section\b[^>]*\bdata-keyboard-intro\b[\s\S]*?<\/section>/)?.[0];
if (!introMarkup) throw new Error('Unable to isolate the generated keyboard intro markup.');
if (!introMarkup.includes('Starting automatically')) throw new Error('Generated keyboard intro is missing automatic-start copy.');
const introOpeningTags = introMarkup.match(/<(?!\/|!)[a-z][\w-]*\b[^>]*>/gi) ?? [];
if (introOpeningTags.length >= 100) throw new Error(`Keyboard intro DOM budget exceeded: ${introOpeningTags.length} opening tags`);
const introSkipTags = introMarkup.match(/<a\b[^>]*\bdata-intro-skip\b[^>]*>/g) ?? [];
if (introSkipTags.length !== 1) {
  throw new Error('Keyboard intro must contain exactly one focus-only skip fallback.');
}
const expectedIntroSkip = `${basePrefix}/?intro=skip#overview`;
if (!introSkipTags[0].includes('class="intro-accessible-skip"') || !introSkipTags[0].includes(`href="${expectedIntroSkip}"`)) {
  throw new Error('Keyboard intro skip fallback does not respect the active base path.');
}
const introButtons = introMarkup.match(/<button\b[^>]*>/g) ?? [];
if (
  introButtons.length !== 1
  || !introButtons[0].includes('class="intro-sound-toggle"')
  || !introButtons[0].includes('data-sound-toggle')
  || !introButtons[0].includes('aria-label="Keyboard sound"')
  || !introButtons[0].includes('aria-pressed="true"')
) {
  throw new Error('Keyboard intro must contain only the compact sound toggle button.');
}
for (const retiredControl of ['data-intro-start', 'data-intro-controls', 'class="intro-control']) {
  if (introMarkup.includes(retiredControl)) throw new Error(`Visible intro control returned: ${retiredControl}`);
}

const introScriptSrc = homeHtml.match(/<script\b[^>]*src="([^"]*KeyboardIntro[^"]*\.js)"/)?.[1];
if (!introScriptSrc) throw new Error('Unable to locate the generated keyboard intro script.');
const introScriptPath = introScriptSrc.slice(basePrefix.length).replace(/^\//, '');
const introScript = readFileSync(join(dist, introScriptPath), 'utf8');
if (!introScript.includes('force-cache') || introScript.includes('no-store')) {
  throw new Error('Production keyboard audio must use the content-hashed force-cache branch only.');
}

const keyTags = introMarkup.match(/<span\b[^>]*\bclass="kb-key"[^>]*>/g) ?? [];
if (keyTags.length !== 67) throw new Error(`Expected 67 generated physical keys, found ${keyTags.length}`);
const generatedKeyCodes = keyTags.map((tag) => tag.match(/\bdata-key="([^"]+)"/)?.[1]).filter(Boolean);
if (generatedKeyCodes.length !== 67 || new Set(generatedKeyCodes).size !== 67) {
  throw new Error('Generated keyboard keys must expose 67 unique data-key values.');
}
for (const requiredCode of ['ShiftLeft', 'KeyA', 'KeyB', 'Space', 'Enter']) {
  if (!generatedKeyCodes.includes(requiredCode)) throw new Error(`Generated keyboard is missing ${requiredCode}.`);
}
if (introMarkup.includes('<canvas') || /\b(?:webgl|three\.js)\b/i.test(introMarkup)) {
  throw new Error('Generated keyboard intro contains a prohibited rendering runtime.');
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

/** @type {string[]} */
const keyboardAudioFiles = [];
/** @type {string[]} */
const sourceRecordingFiles = [];
/** @param {string} directory */
function collectKeyboardAudio(directory) {
  for (const entry of readdirSync(directory)) {
    const file = join(directory, entry);
    if (statSync(file).isDirectory()) collectKeyboardAudio(file);
    else if (/^(?:key-0[1-4]|space|enter)\.[^.]+\.webm$/.test(basename(file))) keyboardAudioFiles.push(file);
    else if (/keyboard[^/]*\.mp3$/i.test(basename(file))) sourceRecordingFiles.push(file);
  }
}
collectKeyboardAudio(dist);
if (keyboardAudioFiles.length !== 6) {
  throw new Error(`Expected six emitted keyboard WebM assets, found ${keyboardAudioFiles.length}. Audio must not be inlined.`);
}
if (keyboardAudioFiles.some((file) => statSync(file).size === 0)) throw new Error('An emitted keyboard audio asset is empty.');
if (sourceRecordingFiles.length) throw new Error(`Full keyboard source recording was deployed: ${sourceRecordingFiles.join(', ')}`);

console.log(`Generated-output checks passed: ${htmlFiles.length} HTML pages, ${internalLinks.length} internal references, ${keyTags.length} keys in ${introOpeningTags.length} intro nodes, and ${keyboardAudioFiles.length} audio assets verified.`);
