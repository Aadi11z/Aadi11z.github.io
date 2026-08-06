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

if (cssGzip > CSS_BUDGET) throw new Error(`CSS budget exceeded: ${cssGzip} > ${CSS_BUDGET} bytes gzip`);
if (jsGzip > JS_BUDGET) throw new Error(`JavaScript budget exceeded: ${jsGzip} > ${JS_BUDGET} bytes gzip`);
for (const file of imageFiles) {
  const size = statSync(file).size;
  if (size > IMAGE_BUDGET) throw new Error(`Image budget exceeded: ${file} is ${size} bytes`);
}

const css = cssFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
if (!css.includes('prefers-reduced-motion') || !css.includes('data-motion') || !css.includes('reduced')) {
  throw new Error('Generated CSS is missing system or user-controlled reduced-motion handling.');
}

console.log(`Budget checks passed: CSS ${cssGzip} B gzip, JS ${jsGzip} B gzip, ${imageFiles.length} images within ${IMAGE_BUDGET} B each.`);
