import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/data/profile.ts',
  'src/data/projects.ts',
  'src/data/research.ts',
  'src/data/playgrounds/unlearning.ts',
  'src/data/keyboard-layout.ts',
  'src/data/intro-sequence.ts',
  'src/layouts/BaseLayout.astro',
  'src/components/Hero.astro',
  'src/components/ResearchCard.astro',
  'src/components/PaperCard.astro',
  'src/components/intro/KeyboardIntro.astro',
  'src/components/intro/KeyboardScene.astro',
  'src/scripts/intro/intro-controller.ts',
  'src/scripts/intro/device-policy.ts',
  'src/scripts/intro/visit-policy.ts',
  'src/scripts/intro/keyboard-controller.ts',
  'src/scripts/intro/audio-context.ts',
  'src/scripts/intro/audio-engine.ts',
  'src/styles/keyboard-intro.css',
  'src/styles/hero.css',
  'src/components/ThemeToggle.astro',
  'src/components/playgrounds/UnlearningExplorer.astro',
  'src/scripts/section-deck.ts',
  'src/pages/index.astro',
  'src/pages/projects/index.astro',
  'src/pages/projects/[slug].astro',
  'src/pages/lab/index.astro',
  'src/pages/404.astro',
  'src/assets/audio/keyboard/key-01.webm',
  'src/assets/audio/keyboard/key-02.webm',
  'src/assets/audio/keyboard/key-03.webm',
  'src/assets/audio/keyboard/key-04.webm',
  'src/assets/audio/keyboard/space.webm',
  'src/assets/audio/keyboard/enter.webm',
  'src/assets/audio/keyboard/PROVENANCE.md',
  'scripts/generate-keyboard-audio.mjs',
  'public/Aaditya_Bhatnagar_Resume.pdf',
  'public/favicon.svg',
  'public/og-image.svg',
  'public/og-image.png',
];

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`Missing required file: ${file}`);
}

for (const retiredFile of [
  'src/components/visuals/HeroVisual.astro',
  'src/components/visuals/MechanicalKeyboard.astro',
  'src/components/intro/IntroControls.astro',
]) {
  if (existsSync(retiredFile)) throw new Error(`Retired keyboard implementation returned: ${retiredFile}`);
}

/** @param {string} file */
const read = (file) => readFileSync(file, 'utf8');
const projects = read('src/data/projects.ts');
const research = read('src/data/research.ts');
const profile = read('src/data/profile.ts');
const explorer = read('src/data/playgrounds/unlearning.ts');
const site = read('src/data/site.ts');
const keyboardLayout = read('src/data/keyboard-layout.ts');
const introSequence = read('src/data/intro-sequence.ts');
const sectionDeck = read('src/scripts/section-deck.ts');
const keyboardIntro = read('src/components/intro/KeyboardIntro.astro');
const keyboardScene = read('src/components/intro/KeyboardScene.astro');
const introController = read('src/scripts/intro/intro-controller.ts');
const devicePolicy = read('src/scripts/intro/device-policy.ts');
const visitPolicy = read('src/scripts/intro/visit-policy.ts');
const keyboardController = read('src/scripts/intro/keyboard-controller.ts');
const audioContext = read('src/scripts/intro/audio-context.ts');
const audioEngine = read('src/scripts/intro/audio-engine.ts');
const audioGenerator = read('scripts/generate-keyboard-audio.mjs');
const keyboardStyles = read('src/styles/keyboard-intro.css');
const gitignore = read('.gitignore');
const baseLayout = read('src/layouts/BaseLayout.astro');
const homeStyles = read('src/styles/home.css');
const indexPage = read('src/pages/index.astro');
const header = read('src/components/Header.astro');
const packageJson = JSON.parse(read('package.json'));

/** @param {string} source @param {string} expected @param {string} label */
const assertIncludes = (source, expected, label) => {
  if (!source.includes(expected)) throw new Error(`${label} is missing: ${expected}`);
};

const forbidden = ['example.com', 'your-repo', 'placeholder', 'lorem ipsum'];
for (const value of forbidden) {
  if (projects.toLowerCase().includes(value)) throw new Error(`Placeholder content found: ${value}`);
}

const requiredSlugs = ['grounddesk', 'mlp-trainer-agentic-tutor', 'nrg', 'qnt', 'deeplense', 'machine-unlearning-vision-language-models', 'finetuning-defence-adversarial-datasets'];
for (const slug of requiredSlugs) assertIncludes(projects, `slug: '${slug}'`, 'Project data');

const requiredCategories = ['AI', 'ML', 'Software Dev', 'Quant', 'Data'];
for (const category of requiredCategories) assertIncludes(projects, `'${category}'`, 'Project categories');

for (const paper of ['https://arxiv.org/abs/2103.00020', 'https://arxiv.org/abs/2106.09685']) {
  assertIncludes(research, paper, 'Primary paper references');
}
assertIncludes(research, "status: 'Implementation reference'", 'Paper implementation-reference status');

assertIncludes(profile, "email: '11aadityab@gmail.com'", 'Canonical contact email');
if (profile.includes('11aadityad@gmail.com')) throw new Error('Known incorrect email remains in profile data.');
assertIncludes(explorer, "provenance: 'measured'", 'Explorer data provenance');
if (/membershipInference:\s*[0-9]/.test(explorer)) throw new Error('Unsupported membership-inference metric was introduced.');

for (const behavior of ['pushState', 'popstate', 'hashchange', 'aria-current']) {
  assertIncludes(sectionDeck, behavior, 'Section deck behavior');
}
for (const mapping of ["['work', 'projects']", "['about', 'overview']", "['contact', 'overview']"]) {
  assertIncludes(sectionDeck, mapping, 'Legacy deep-link mapping');
}

assertIncludes(keyboardIntro, 'data-keyboard-intro', 'Keyboard intro root');
assertIncludes(keyboardIntro, 'data-typed-name', 'Synchronized typed-name output');
assertIncludes(keyboardIntro, 'aria-live="polite"', 'Keyboard intro status');
assertIncludes(keyboardIntro, 'Starting automatically', 'Automatic intro copy');
assertIncludes(keyboardScene, 'KEYBOARD_LAYOUT.map((key)', 'Data-driven keyboard rendering');
assertIncludes(keyboardScene, 'data-key={key.code}', 'Individually addressable keys');
assertIncludes(keyboardScene, 'aria-hidden="true"', 'Decorative keyboard accessibility');
for (const control of ['data-intro-skip', '?intro=skip', 'data-intro-prompt', 'data-sound-toggle']) {
  assertIncludes(keyboardIntro, control, 'Keyboard intro fallback controls');
}
for (const retiredControl of ['data-intro-start', 'data-intro-controls']) {
  if (keyboardIntro.includes(retiredControl)) throw new Error(`Visible intro control returned: ${retiredControl}`);
}

for (const behavior of [
  'AbortController',
  'mountedIntros',
  "matchMedia('(prefers-reduced-motion: reduce)')",
  "event.key === 'Escape'",
  "addEventListener('visibilitychange'",
  "addEventListener('pagehide'",
  "addEventListener('pageshow'",
  "this.intro.addEventListener('pointerdown', this.handleIntroPointerDown, options)",
  'startViewTransition',
  'isInteractiveTarget',
  'unlockThenPressEnter',
  "sessionStorage.setItem(this.sessionKey, 'seen')",
  "this.keyboard.releaseAll('script')",
  'skip(focusHeading',
  "'awaiting-gesture': 'Starting automatically'",
  "'enter-armed': 'Click anywhere or press Enter'",
  "this.soundToggle?.addEventListener('click', this.handleSoundClick, options)",
  'this.scheduleAutomaticStart()',
  'if (this.autoEnter) this.scheduleAutomaticEnter()',
  "document.visibilityState === 'visible'",
  "this.intro.dataset.enterMode = this.autoEnter ? 'automatic' : 'manual'",
  'if (requestAudio) this.requestAudioUnlock()',
  'this.startSequence(event.isTrusted)',
  "this.phase === 'impact' || this.phase === 'transitioning'",
  "if (document.visibilityState !== 'visible' || this.phase !== 'awaiting-gesture') return",
  "if (document.visibilityState !== 'visible' || this.phase !== 'enter-armed') return",
  'if (signal.aborted) return',
  'if (this.completed || signal.aborted) return',
]) {
  assertIncludes(introController, behavior, 'Cancellable intro controller');
}
const automaticStart = introController.match(/private scheduleAutomaticStart\(\): void \{[\s\S]*?\n  \}/)?.[0];
if (!automaticStart) throw new Error('Automatic intro scheduler could not be inspected.');
assertIncludes(automaticStart, 'this.startSequence(true)', 'Automatic audio opportunity');
if (automaticStart.includes('this.startSequence(false)')) {
  throw new Error('Automatic intro suppresses the browser autoplay opportunity.');
}
for (const behavior of [
  'shouldAutoEnterIntro',
  'coarsePrimaryPointer',
  'anyHoverAvailable',
]) {
  assertIncludes(devicePolicy, behavior, 'Touch-device Enter policy');
}
for (const behavior of ['classifyIntroVisit', 'internalHandoff', 'historyRestoreWasNotRestored']) {
  assertIncludes(visitPolicy, behavior, 'Tab visit policy');
}
for (const phase of ['awaiting-gesture', 'lighting', 'typing', 'settling', 'enter-armed', 'impact', 'transitioning', 'entered']) {
  assertIncludes(introController, `'${phase}'`, 'Intro phase state machine');
}
for (const behavior of ['pressKey(', 'releaseKey(', 'releaseAll(', "addEventListener('keydown'", "addEventListener('keyup'", "addEventListener('blur'"]) {
  assertIncludes(keyboardController, behavior, 'Keyboard mechanics controller');
}

for (const asset of ['key01Url', 'key02Url', 'key03Url', 'key04Url', 'spaceUrl', 'enterUrl']) {
  assertIncludes(audioEngine, asset, 'Keyboard audio asset set');
}
for (const behavior of [
  'window.AudioContext',
  "import.meta.env.DEV ? 'no-store' : 'force-cache'",
  'fetch(url, { cache: audioCacheMode, signal:',
  'loadController.abort()',
  'Promise.allSettled',
  'playbackRate.value',
  'const maxVoices = 6',
  'const resumeTimeoutMs = 800',
  'prepare: () => Promise<boolean>',
  'Promise.all([',
  "if (context?.state === 'running' && buffers.size > 0)",
  'resumeAudioContext(activeContext, resumeTimeoutMs)',
  'A trusted gesture may have resumed the shared context',
  "localStorage.getItem(soundPreferenceKey) === 'muted'",
  'localStorage.setItem(soundPreferenceKey',
  'toggleMuted',
]) {
  assertIncludes(audioEngine, behavior, 'Gesture-gated Web Audio engine');
}
for (const behavior of ['context.resume()', 'Promise.race', "context.state === 'running'"]) {
  assertIncludes(audioContext, behavior, 'Retryable audio-context resume');
}
if (!/normal:\s*\[key01Url, key02Url, key03Url, key04Url\]/.test(audioEngine)) {
  throw new Error('Normal-key audio must use four variations.');
}
if (!/space:\s*\[spaceUrl\]/.test(audioEngine) || !/enter:\s*\[enterUrl\]/.test(audioEngine)) {
  throw new Error('Space and Enter must use distinct audio samples.');
}
for (const extractionRule of [
  'expectedSourceSha256',
  'atrim=start=',
  "'-application', 'audio'",
  "pitchRate: 44_000",
]) {
  assertIncludes(audioGenerator, extractionRule, 'Deterministic keyboard audio extraction');
}
assertIncludes(gitignore, 'src/assets/audio/keyboard/*.mp3', 'Full keyboard recording exclusion');

for (const rendering of [
  'perspective:',
  'transform-style: preserve-3d',
  '[data-pressed',
  '--kb-hue',
  'prefers-reduced-motion: reduce',
  "[data-keyboard-intro][data-phase='enter-armed']",
  "[data-audio-state='ready']",
]) {
  assertIncludes(keyboardStyles, rendering, 'Keyboard rendering strategy');
}
for (const tilt of ['--kb-tilt: 17deg', '--kb-tilt: 16deg', '--kb-tilt: 15deg']) {
  assertIncludes(keyboardStyles, tilt, 'Shallow keyboard perspective');
}
if (/--kb-tilt:\s*(?:39|41|44)deg/.test(keyboardStyles)) {
  throw new Error('Excessive keyboard foreshortening returned.');
}

const introSource = [keyboardIntro, keyboardScene, introController, devicePolicy, keyboardController, audioEngine, keyboardStyles, keyboardLayout, introSequence].join('\n');
/** @type {Array<[RegExp, string]>} */
const prohibitedRuntimePatterns = [
  [/<canvas\b/i, 'Canvas'],
  [/\b(?:webgl|three\.js)\b/i, 'WebGL/Three.js'],
  [/from\s+['"](?:react|react-dom|three|@react-three\/[^'"]+)['"]/i, 'React/Three import'],
  [/\b(?:tailwindcss|@tailwind)\b/i, 'Tailwind'],
  [/mechanical-keyboard[^'"\s)]*\.(?:png|jpe?g|webp|avif)/i, 'Raster keyboard'],
];
for (const [pattern, label] of prohibitedRuntimePatterns) {
  if (pattern.test(introSource)) throw new Error(`${label} is not permitted in the keyboard intro.`);
}
for (const dependency of ['react', 'react-dom', 'three', 'tailwindcss', 'gsap', 'animejs', 'motion']) {
  if (packageJson.dependencies?.[dependency] || packageJson.devDependencies?.[dependency]) {
    throw new Error(`Prohibited intro dependency returned: ${dependency}`);
  }
}

if (!baseLayout.includes("classList.add('js')") || !homeStyles.includes("html.js[data-intro-visit='first'] .hero:not([data-intro-state]) .hero-overview")) {
  throw new Error('Hero refresh flash prevention is missing.');
}
assertIncludes(baseLayout, "root.dataset.heroIntroState = root.dataset.introVisit === 'first' ? 'active' : 'entered'", 'Pre-paint hero intro state');
assertIncludes(baseLayout, "sessionStorage.getItem(introKey) === 'seen'", 'Per-tab first-visit initialization');
assertIncludes(baseLayout, "`${introKey}:handoff`", 'Internal navigation handoff');
assertIncludes(baseLayout, "navigationType === 'back_forward'", 'Restored-tab navigation heuristic');
assertIncludes(baseLayout, "if (root.dataset.introMode !== 'design' && introKey) sessionStorage.setItem(introKey, 'seen')", 'Explicit intro-skip persistence');
assertIncludes(baseLayout, "root.dataset.introVisit = introVisit", 'Per-tab first-visit decision');
assertIncludes(site, "introSessionKey = 'aaditya-portfolio-intro-v2'", 'Versioned intro session key');

if (indexPage.includes('id="work"') || indexPage.includes('id="about"') || indexPage.includes('id="contact"')) {
  throw new Error('Retired homepage panels returned.');
}
for (const section of ['projects', 'research', 'experience']) {
  if (!`${indexPage}\n${header}`.includes(`data-section-link="${section}"`)) throw new Error(`Homepage navigation is missing: ${section}`);
}
if (!indexPage.includes('<ResearchCard') || !indexPage.includes('<PaperCard')) throw new Error('Research or paper cards are missing from the homepage.');
if (existsSync('src/components/MotionPreference.astro') || baseLayout.includes("localStorage.getItem('motion')") || `${baseLayout}\n${header}`.includes('data-motion')) {
  throw new Error('The retired manual motion preference returned.');
}

for (const behavior of ['PUBLIC_INTRO_MODE', 'introMode']) {
  if (!`${site}\n${baseLayout}\n${introController}`.includes(behavior)) throw new Error(`Explicit intro modes are missing: ${behavior}`);
}
if (packageJson.scripts.dev !== 'astro dev' || packageJson.scripts['dev:design'] !== 'PUBLIC_INTRO_MODE=design astro dev') {
  throw new Error('The normal and design intro commands are not configured correctly.');
}
for (const removedMode of ['dev:normal', 'dev:recruiter-preview', 'build:normal', 'build:design']) {
  if (packageJson.scripts[removedMode]) throw new Error(`Removed intro mode returned: ${removedMode}`);
}

console.log(`Content checks passed: ${requiredFiles.length} required files, ${requiredSlugs.length} projects, ${requiredCategories.length} categories, and the native keyboard intro architecture verified.`);
