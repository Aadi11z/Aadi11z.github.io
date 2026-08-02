import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/data/profile.ts',
  'src/data/projects.ts',
  'src/data/research.ts',
  'src/layouts/BaseLayout.astro',
  'src/components/Hero.astro',
  'src/pages/index.astro',
  'src/pages/projects/index.astro',
  'src/pages/projects/[slug].astro',
  'src/pages/404.astro',
  'public/favicon.svg',
  'public/og-image.svg',
  'public/og-image.png',
];

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`Missing required file: ${file}`);
}

const projects = readFileSync('src/data/projects.ts', 'utf8');
const profile = readFileSync('src/data/profile.ts', 'utf8');
const forbidden = ['example.com', 'your-repo', 'placeholder', 'lorem ipsum'];
for (const value of forbidden) {
  if (projects.toLowerCase().includes(value)) throw new Error(`Placeholder content found: ${value}`);
}

if (!profile.includes("email: '11aadityab@gmail.com'")) {
  throw new Error('Canonical contact email is missing or incorrect.');
}
if (profile.includes('11aadityad@gmail.com')) {
  throw new Error('Known incorrect email remains in profile data.');
}

console.log(`Content checks passed: ${requiredFiles.length} required files verified.`);
