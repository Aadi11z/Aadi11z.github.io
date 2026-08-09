import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/data/profile.ts',
  'src/data/projects.ts',
  'src/data/research.ts',
  'src/data/playgrounds/unlearning.ts',
  'src/layouts/BaseLayout.astro',
  'src/components/Hero.astro',
  'src/components/ResearchCard.astro',
  'src/components/PaperCard.astro',
  'src/components/visuals/MechanicalKeyboard.astro',
  'src/styles/hero.css',
  'src/components/ThemeToggle.astro',
  'src/components/playgrounds/UnlearningExplorer.astro',
  'src/scripts/section-deck.ts',
  'src/pages/index.astro',
  'src/pages/projects/index.astro',
  'src/pages/projects/[slug].astro',
  'src/pages/lab/index.astro',
  'src/pages/404.astro',
  'public/Aaditya_Bhatnagar_Resume.pdf',
  'public/favicon.svg',
  'public/og-image.svg',
  'public/og-image.png',
];

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`Missing required file: ${file}`);
}

const projects = readFileSync('src/data/projects.ts', 'utf8');
const research = readFileSync('src/data/research.ts', 'utf8');
const profile = readFileSync('src/data/profile.ts', 'utf8');
const explorer = readFileSync('src/data/playgrounds/unlearning.ts', 'utf8');
const site = readFileSync('src/data/site.ts', 'utf8');
const sectionDeck = readFileSync('src/scripts/section-deck.ts', 'utf8');
const heroVisual = readFileSync('src/components/visuals/HeroVisual.astro', 'utf8');
const mechanicalKeyboard = readFileSync('src/components/visuals/MechanicalKeyboard.astro', 'utf8');
const baseLayout = readFileSync('src/layouts/BaseLayout.astro', 'utf8');
const homeStyles = readFileSync('src/styles/home.css', 'utf8');
const heroStyles = readFileSync('src/styles/hero.css', 'utf8');
const indexPage = readFileSync('src/pages/index.astro', 'utf8');
const header = readFileSync('src/components/Header.astro', 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const forbidden = ['example.com', 'your-repo', 'placeholder', 'lorem ipsum'];
for (const value of forbidden) {
  if (projects.toLowerCase().includes(value)) throw new Error(`Placeholder content found: ${value}`);
}

const requiredSlugs = ['grounddesk', 'mlp-trainer-agentic-tutor', 'nrg', 'qnt', 'deeplense', 'machine-unlearning-vision-language-models', 'finetuning-defence-adversarial-datasets'];
for (const slug of requiredSlugs) if (!projects.includes(`slug: '${slug}'`)) throw new Error(`Missing project record: ${slug}`);

const requiredCategories = ['AI', 'ML', 'Software Dev', 'Quant', 'Data'];
for (const category of requiredCategories) if (!projects.includes(`'${category}'`)) throw new Error(`Missing project category: ${category}`);

for (const paper of ['https://arxiv.org/abs/2103.00020', 'https://arxiv.org/abs/2106.09685']) {
  if (!research.includes(paper)) throw new Error(`Missing primary paper reference: ${paper}`);
}
if (!research.includes("status: 'Implementation reference'")) throw new Error('Paper implementation-reference status is missing.');

if (!profile.includes("email: '11aadityab@gmail.com'")) throw new Error('Canonical contact email is missing or incorrect.');
if (profile.includes('11aadityad@gmail.com')) throw new Error('Known incorrect email remains in profile data.');
if (!explorer.includes("provenance: 'measured'")) throw new Error('Explorer data must include explicit measurement provenance.');
if (/membershipInference:\s*[0-9]/.test(explorer)) throw new Error('Unsupported membership-inference metric was introduced.');
for (const behavior of ['pushState', 'popstate', 'hashchange', 'aria-current']) {
  if (!sectionDeck.includes(behavior)) throw new Error(`Section deck is missing ${behavior} behavior.`);
}
for (const mapping of ["['work', 'projects']", "['about', 'overview']", "['contact', 'overview']"]) {
  if (!sectionDeck.includes(mapping)) throw new Error(`Section deck is missing legacy deep-link mapping: ${mapping}`);
}
for (const behavior of ['data-typing-station', 'data-typed-name', 'data-typing-enter', 'typing-rgb-ambient', 'keyboard-chassis', 'MechanicalKeyboard', '--key-press-hue', 'pressVisualKeys', 'getPhysicalKeyValue', "addEventListener('keyup'", 'pressCharacterKey', 'triggerRgbPulse', "matchMedia('(prefers-reduced-motion: reduce)')", "reducedMotion.addEventListener('change'", 'openOverview', 'pressEnterAndOpen', 'data-enter-state', '<p class="typing-kicker">Portfolio Website</p>']) {
  if (!heroVisual.includes(behavior)) throw new Error(`Hero typing animation is missing ${behavior} behavior.`);
}
for (const behavior of ['viewBox="0 0 1200 505"', 'hero-keyboard-spectrum', 'mechanical-key-top', 'data-key={key.value}', 'const keyHeight = 52', 'const keyGap = 6', 'spec.width ?? 57', 'layoutRow(320']) {
  if (!mechanicalKeyboard.includes(behavior)) throw new Error(`Vector keyboard is missing ${behavior}.`);
}
if (heroVisual.includes('mechanical-keyboard-rgb.webp')) throw new Error('The raster keyboard remains connected after the SVG conversion.');
for (const behavior of ['aspect-ratio: 1200 / 505', '.typing-rgb-ambient', '.mechanical-keyboard-svg', '.mechanical-key.is-pressed', '@property --keyboard-rgb-hue', '--key-rgb-hue', 'keyboard-svg-spectrum', 'typing-rgb-ambient-flow']) {
  if (!heroStyles.includes(behavior)) throw new Error(`Hero RGB keyboard styling is missing ${behavior}.`);
}
if (!baseLayout.includes("classList.add('js')") || !homeStyles.includes("html.js[data-intro-visit='first'] .hero:not([data-intro-state]) .hero-overview")) {
  throw new Error('Hero refresh flash prevention is missing.');
}
if (!baseLayout.includes("root.dataset.heroIntroState = root.dataset.introVisit === 'first' ? 'active' : 'entered'")) {
  throw new Error('Pre-paint hero intro state is missing.');
}
if (indexPage.includes('id="work"') || indexPage.includes('id="about"') || indexPage.includes('id="contact"')) {
  throw new Error('Retired homepage panels returned.');
}
for (const section of ['overview', 'projects', 'research', 'experience']) {
  if (!`${indexPage}\n${header}`.includes(`data-section-link="${section}"`) && section !== 'overview') {
    throw new Error(`Homepage navigation is missing: ${section}`);
  }
}
if (!indexPage.includes('<ResearchCard') || !indexPage.includes('<PaperCard')) throw new Error('Research or paper cards are missing from the homepage.');
if (existsSync('src/components/MotionPreference.astro') || baseLayout.includes("localStorage.getItem('motion')") || `${baseLayout}\n${header}`.includes('data-motion')) {
  throw new Error('The retired manual motion preference returned.');
}
for (const behavior of ["setIntroState('active')", "setIntroState('exiting')", "setIntroState('entered')"]) {
  if (!heroVisual.includes(behavior)) throw new Error(`Hero intro state transition is missing: ${behavior}`);
}
for (const selector of [
  "html.js[data-hero-intro-state='active'] body[data-layout='deck'] .site-header",
  "html.js[data-hero-intro-state='exiting'] body[data-layout='deck'] .site-header",
]) {
  if (!homeStyles.includes(selector)) throw new Error(`Hero header suppression is missing: ${selector}`);
}
if (!site.includes("introSessionKey = 'aaditya-portfolio-intro-v1'") || !baseLayout.includes("sessionStorage.getItem(introKey) === 'seen'") || !baseLayout.includes("introSeen || skipIntro ? 'returning' : 'first'")) {
  throw new Error('Per-tab first-visit state is missing from the pre-paint initialization.');
}
for (const behavior of ['PUBLIC_INTRO_MODE', 'introMode', 'isDesignMode', 'previewEnterPress', "showCompleteTitle(!isDesignMode)"]) {
  if (!`${site}\n${baseLayout}\n${heroVisual}`.includes(behavior)) throw new Error(`Explicit intro modes are missing: ${behavior}`);
}
if (packageJson.scripts.dev !== 'astro dev' || packageJson.scripts['dev:design'] !== 'PUBLIC_INTRO_MODE=design astro dev') {
  throw new Error('The normal and design intro commands are not configured correctly.');
}
for (const removedMode of ['dev:normal', 'dev:recruiter-preview', 'build:normal', 'build:design']) {
  if (packageJson.scripts[removedMode]) throw new Error(`Removed intro mode returned: ${removedMode}`);
}
for (const removedControl of ['data-typing-replay', 'data-typing-readout', 'typing-stage-meta', 'typing-subtitle']) {
  if (heroVisual.includes(removedControl)) throw new Error(`Removed intro control returned: ${removedControl}`);
}
for (const behavior of ["dataset.introVisit === 'returning'", "sessionStorage.setItem(introSessionKey, 'seen')"]) {
  if (!heroVisual.includes(behavior)) throw new Error(`Hero first-visit behavior is missing: ${behavior}`);
}
for (const timing of ['typingStartDelay', 'characterDelay', 'completedTitleHold', 'enterPressHold']) {
  const value = Number(heroVisual.match(new RegExp(`const ${timing} = (\\d+);`))?.[1]);
  if (!value || value > 5000) throw new Error(`Hero animation timing is invalid: ${timing}`);
}
if (!heroVisual.includes('const typingStartDelay = 250;') || !heroVisual.includes('const completedTitleHold = 1200;') || !heroVisual.includes('const enterPressHold = 250;')) {
  throw new Error('Requested hero timing adjustments are missing.');
}

console.log(`Content checks passed: ${requiredFiles.length} required files, ${requiredSlugs.length} projects, and ${requiredCategories.length} categories verified.`);
