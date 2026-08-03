# Aaditya Bhatnagar — Portfolio

A static technical portfolio for Aaditya Bhatnagar. The “Editorial Manga Lab” design combines an evidence-led editorial layout with restrained manga-panel framing, original technical SVGs, native page transitions, and small interactive research tools.

## Stack

- Astro 7 static-site generation
- TypeScript and native `.astro` components
- Typed content modules in `src/data/`
- Modular tokenized CSS in `src/styles/`
- Native browser JavaScript for navigation, filters, preferences, and explorers
- No backend, CMS, client framework, remote font, or animation library

Node 24 is pinned in `.node-version` for CI and Cloudflare Pages.

## Local development

```bash
npm ci
npm run dev
```

Open `http://localhost:4321/`. Local development uses the root path unless `PUBLIC_BASE_PATH` is explicitly set.

The hero intro defaults to a static design preview in development: the completed keyboard screen remains visible, and pressing Enter only previews the key state. To run the real first-visit animation locally:

```bash
PUBLIC_INTRO_DEBUG=false npm run dev
```

To force the static preview in any build or preview environment:

```bash
PUBLIC_INTRO_DEBUG=true npm run build
```

Production builds default to the real once-per-browser intro when `PUBLIC_INTRO_DEBUG` is unset.

## Validation

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run generated-check
npm run budget-check
npm audit --omit=dev --audit-level=moderate
```

`npm run validate` runs content checks, Astro diagnostics, a production build, generated-output checks, and performance-budget checks.

To test a GitHub project-site base path:

```bash
PUBLIC_SITE_URL=https://aadi11z.github.io PUBLIC_BASE_PATH=website npm run build
PUBLIC_SITE_URL=https://aadi11z.github.io PUBLIC_BASE_PATH=website npm run generated-check
```

## Content editing

- `src/data/profile.ts` — identity, education, About copy, and achievement
- `src/data/projects.ts` — archive records, featured work, project evidence, and detail sections
- `src/data/research.ts` — research-note presentation
- `src/data/experience.ts` — professional experience and certifications
- `src/data/skills.ts` — capabilities and primary tools
- `src/data/playgrounds/unlearning.ts` — measured machine-unlearning explorer data

Project links are optional. Add `liveUrl`, `repositoryUrl`, or `reportUrl` only when the public URL is real. A project receives a static detail page when it has a `detail` object in `src/data/projects.ts`.

Explorer observations require an explicit provenance value. Missing experiment results must remain unavailable rather than being estimated or interpolated.

## Presentation architecture

- `src/components/visuals/` — original project and hero SVG illustrations
- `src/components/playgrounds/` — progressively enhanced static explorers
- `src/scripts/` — small native-browser interaction modules
- `src/styles/tokens.css` — color, spacing, type, and motion tokens
- `src/styles/global.css` — reset, typography, and shared utilities
- `src/styles/layout.css` — navigation, footer, résumé, and 404 layouts
- `src/styles/home.css` — homepage sections
- `src/styles/projects.css` — archive, project cards, and case studies
- `src/styles/research.css` — research-note presentation
- `src/styles/playgrounds.css` — explorer and lab layouts
- `src/styles/effects.css` — reduced motion, reveals, and native View Transitions

Theme and motion preferences follow the user’s system setting on first visit and persist manual choices in `localStorage`. Important content is rendered during the Astro build and remains available without JavaScript.

## Résumé privacy

The public download is `public/Aaditya_Bhatnagar_Resume.pdf`. It is a phone-redacted, rasterized public copy; it is not byte-for-byte identical to the private source CV. The original phone-bearing CV must remain outside the repository and every deployable directory.

To replace the résumé:

1. Start from a private source outside this repository.
2. Remove the phone number without applying the redaction rectangle to unrelated pages.
3. Export the public file as `public/Aaditya_Bhatnagar_Resume.pdf`.
4. Render every page and confirm the PDF is legible.
5. Confirm OCR and `pdftotext` cannot recover the phone number.

## Deployment variables

Configuration is centralized in `astro.config.mjs` and `src/data/site.ts`:

- `PUBLIC_SITE_URL` — production origin without a trailing slash
- `PUBLIC_BASE_PATH` — deployment subpath without surrounding slashes; empty for root deployments

These values control canonical URLs, sitemap URLs, Open Graph URLs, the web manifest, résumé links, assets, and internal navigation.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds with Node 24, runs validation, uploads `dist`, and deploys the `main` branch.

### User site

Repository name: `Aadi11z.github.io`

```text
PUBLIC_SITE_URL=https://aadi11z.github.io
PUBLIC_BASE_PATH=
```

The resulting site is `https://aadi11z.github.io/`.

### Project site

For a repository such as `website`:

```text
PUBLIC_SITE_URL=https://aadi11z.github.io
PUBLIC_BASE_PATH=website
```

The resulting site is `https://aadi11z.github.io/website/`. Update the workflow environment values before deploying in this mode.

### Custom domain

Set `PUBLIC_SITE_URL` to the custom HTTPS origin and leave `PUBLIC_BASE_PATH` empty. Add `public/CNAME` only after a real domain has been selected.

## Cloudflare Pages

Use Git integration with:

- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `24` via `.node-version`

Set `PUBLIC_SITE_URL` to the production `pages.dev` or custom-domain origin and leave `PUBLIC_BASE_PATH` empty. Preview deployments can use the production canonical origin to avoid indexing temporary preview URLs. `public/_headers` supplies conservative security headers and immutable caching for hashed Astro assets.

## Vercel and other static hosts

Use `npm run build` and publish `dist`. No server adapter or runtime environment is required.
