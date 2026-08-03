import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/data/profile.ts',
  'src/data/projects.ts',
  'src/data/research.ts',
  'src/data/playgrounds/unlearning.ts',
  'src/layouts/BaseLayout.astro',
  'src/components/Hero.astro',
  'src/components/MotionPreference.astro',
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
const profile = readFileSync('src/data/profile.ts', 'utf8');
const explorer = readFileSync('src/data/playgrounds/unlearning.ts', 'utf8');
const site = readFileSync('src/data/site.ts', 'utf8');
const sectionDeck = readFileSync('src/scripts/section-deck.ts', 'utf8');
const heroVisual = readFileSync('src/components/visuals/HeroVisual.astro', 'utf8');
const baseLayout = readFileSync('src/layouts/BaseLayout.astro', 'utf8');
const homeStyles = readFileSync('src/styles/home.css', 'utf8');
const forbidden = ['example.com', 'your-repo', 'placeholder', 'lorem ipsum'];
for (const value of forbidden) {
  if (projects.toLowerCase().includes(value)) throw new Error(`Placeholder content found: ${value}`);
}

const requiredSlugs = ['grounddesk', 'mlp-trainer-agentic-tutor', 'nrg', 'qnt', 'deeplense', 'machine-unlearning-vision-language-models', 'finetuning-defence-adversarial-datasets'];
for (const slug of requiredSlugs) if (!projects.includes(`slug: '${slug}'`)) throw new Error(`Missing project record: ${slug}`);

const requiredCategories = ['AI Engineering', 'AI Safety / Research', 'Data Science', 'Forecasting', 'Quant Research', 'Software Engineering', 'Computer Vision'];
for (const category of requiredCategories) if (!projects.includes(`'${category}'`)) throw new Error(`Missing project category: ${category}`);

if (!profile.includes("email: '11aadityab@gmail.com'")) throw new Error('Canonical contact email is missing or incorrect.');
if (profile.includes('11aadityad@gmail.com')) throw new Error('Known incorrect email remains in profile data.');
if (!explorer.includes("provenance: 'measured'")) throw new Error('Explorer data must include explicit measurement provenance.');
if (/membershipInference:\s*[0-9]/.test(explorer)) throw new Error('Unsupported membership-inference metric was introduced.');
for (const behavior of ['pushState', 'popstate', 'hashchange', 'aria-current']) {
  if (!sectionDeck.includes(behavior)) throw new Error(`Section deck is missing ${behavior} behavior.`);
}
for (const behavior of ['data-typing-station', 'data-typed-name', 'data-typed-subtitle', 'data-typing-enter', "dataset.motion === 'reduced'", 'motionchange', 'openOverview', 'pressEnterAndOpen', 'data-enter-state']) {
  if (!heroVisual.includes(behavior)) throw new Error(`Hero typing animation is missing ${behavior} behavior.`);
}
if (!baseLayout.includes("classList.add('js')") || !homeStyles.includes("html.js[data-intro-visit='first'] .hero:not([data-intro-state]) .hero-overview")) {
  throw new Error('Hero refresh flash prevention is missing.');
}
if (!site.includes("introStorageKey = 'aaditya-portfolio-intro-v1'") || !baseLayout.includes("introSeen ? 'returning' : 'first'")) {
  throw new Error('Versioned first-visit state is missing from the pre-paint initialization.');
}
for (const behavior of ['PUBLIC_INTRO_MODE', 'introMode', 'isDesignMode', 'previewEnterPress', "showCompleteTitle(!isDesignMode)"]) {
  if (!`${site}\n${baseLayout}\n${heroVisual}`.includes(behavior)) throw new Error(`Explicit intro modes are missing: ${behavior}`);
}
for (const behavior of ["dataset.introVisit === 'returning'", "localStorage.setItem(introStorageKey, 'seen')"]) {
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
