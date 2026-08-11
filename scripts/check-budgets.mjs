import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = 'dist';
if (!existsSync(dist)) throw new Error('Missing dist directory. Run npm run build first.');

/** @type {string[]} */
const files = [];
/** @param {string} directory */
function collect(directory) {
  for (const entry of readdirSync(directory)) {
    const file = join(directory, entry);
    if (statSync(file).isDirectory()) collect(file);
    else files.push(file);
  }
}
collect(dist);

const cssFiles = files.filter((file) => extname(file) === '.css');
const jsFiles = files.filter((file) => extname(file) === '.js');
const htmlFiles = files.filter((file) => extname(file) === '.html');
const audioFiles = files.filter((file) => extname(file).toLowerCase() === '.webm');
const imageFiles = files.filter((file) => ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg'].includes(extname(file).toLowerCase()));

/** @param {string} file */
const gzipSize = (file) => gzipSync(readFileSync(file)).byteLength;
const cssGzip = cssFiles.reduce((total, file) => total + gzipSize(file), 0);
const externalJsGzip = jsFiles.reduce((total, file) => total + gzipSize(file), 0);

let largestInlineJs = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const code = [...html.matchAll(/<script(?![^>]*type=["'](?:application\/ld\+json|application\/json)["'])[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .join('\n');
  largestInlineJs = Math.max(largestInlineJs, gzipSync(code).byteLength);
}

const jsGzip = externalJsGzip + largestInlineJs;
const CSS_BUDGET = 50 * 1024;
const JS_BUDGET = 50 * 1024;
const IMAGE_BUDGET = 200 * 1024;
const HOMEPAGE_RAW_BUDGET = 100 * 1024;
const HOMEPAGE_GZIP_BUDGET = 15 * 1024;
const INTRO_JS_GZIP_BUDGET = 15 * 1024;
const KEYBOARD_AUDIO_BUDGET = 150 * 1024;

if (cssGzip > CSS_BUDGET) throw new Error(`CSS budget exceeded: ${cssGzip} > ${CSS_BUDGET} bytes gzip`);
if (jsGzip > JS_BUDGET) throw new Error(`JavaScript budget exceeded: ${jsGzip} > ${JS_BUDGET} bytes gzip`);
for (const file of imageFiles) {
  const size = statSync(file).size;
  if (size > IMAGE_BUDGET) throw new Error(`Image budget exceeded: ${file} is ${size} bytes`);
}

const homepage = join(dist, 'index.html');
const homepageRaw = statSync(homepage).size;
const homepageGzip = gzipSize(homepage);
if (homepageRaw > HOMEPAGE_RAW_BUDGET) {
  throw new Error(`Homepage raw budget exceeded: ${homepageRaw} > ${HOMEPAGE_RAW_BUDGET} bytes`);
}
if (homepageGzip > HOMEPAGE_GZIP_BUDGET) {
  throw new Error(`Homepage gzip budget exceeded: ${homepageGzip} > ${HOMEPAGE_GZIP_BUDGET} bytes`);
}

const introJsFiles = jsFiles.filter((file) => {
  const source = readFileSync(file, 'utf8');
  return source.includes('data-keyboard-intro')
    || source.includes('__keyboardIntroDebug');
});
const introJsGzip = introJsFiles.reduce((total, file) => total + gzipSize(file), 0);
if (introJsFiles.length && introJsGzip > INTRO_JS_GZIP_BUDGET) {
  throw new Error(`Keyboard intro JavaScript budget exceeded: ${introJsGzip} > ${INTRO_JS_GZIP_BUDGET} bytes gzip`);
}

const keyboardAudioFiles = audioFiles.filter((file) => /\/(?:key-0[1-4]|space|enter)\.[^.]+\.webm$/.test(file));
const keyboardAudioSize = keyboardAudioFiles.reduce((total, file) => total + statSync(file).size, 0);
if (keyboardAudioSize >= KEYBOARD_AUDIO_BUDGET) {
  throw new Error(`Keyboard audio budget exceeded: ${keyboardAudioSize} >= ${KEYBOARD_AUDIO_BUDGET} bytes`);
}

const css = cssFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
if (!css.includes('prefers-reduced-motion')) {
  throw new Error('Generated CSS is missing system reduced-motion handling.');
}

console.log(`Budget checks passed: CSS ${cssGzip} B gzip, JS ${jsGzip} B gzip, intro JS ${introJsGzip} B gzip, homepage ${homepageRaw} B raw/${homepageGzip} B gzip, keyboard audio ${keyboardAudioSize} B, and ${imageFiles.length} images within ${IMAGE_BUDGET} B each.`);
