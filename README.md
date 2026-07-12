# Aaditya Bhatnagar — Portfolio

An editorial, mostly-static portfolio for Aaditya Bhatnagar, built with Astro and TypeScript. It presents grounded AI systems, machine-learning research, quantitative platforms, production experience, education, and contact information without a backend or CMS.

## Stack

- Astro 7 static site generation
- TypeScript with centralized typed content in `src/data/`
- Scoped component markup and tokenized CSS in `src/styles/global.css`
- No React runtime, UI library, external fonts, or animation library

## Local development

```bash
npm install
npm run dev
```

Local development intentionally uses the root path: `http://localhost:4321/`. Do not set `PUBLIC_BASE_PATH` locally unless you specifically want to test a subpath deployment.

## Validation

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=moderate
```

`npm run validate` runs the content test, Astro check, and production build together. Set `ASTRO_TELEMETRY_DISABLED=1` in restricted environments if Astro cannot write its global telemetry preferences.

## Content editing

- `src/data/profile.ts` — identity, education, about copy, and achievement
- `src/data/projects.ts` — project cards and detail-page content
- `src/data/research.ts` — research listings
- `src/data/experience.ts` — professional experience
- `src/data/skills.ts` — skills and primary tools
- `src/components/` — reusable presentation components
- `src/layouts/` — global and project-detail layouts
- `src/styles/global.css` — design tokens, layout, responsive behavior, and theme styles

To add or update a project, edit `src/data/projects.ts`. Add a `sections` array when it needs a detail page; the static route is generated automatically from the project slug. Only add live, repository, report, or poster URLs when they are real and available.

## Resume privacy

The original phone-bearing CV is kept outside this repository at `/private/tmp/Aaditya_Bhatnagar_CV.pdf` and is not part of the deployable artifact. The public file is `public/Aaditya_Bhatnagar_Resume.pdf`: a visually redacted, rasterized copy named professionally for download. The rasterization prevents the removed phone field from being recovered from the PDF text layer. To replace it, update only the public PDF and verify that `pdftotext` cannot recover the private number.

## Deployment configuration

Deployment is centralized in `astro.config.mjs` and `src/data/site.ts`:

- `PUBLIC_SITE_URL` is the production origin, such as `https://aadi11z.github.io` or `https://portfolio.example.com`.
- `PUBLIC_BASE_PATH` is the deployment subpath without a trailing slash. It is empty for the intended GitHub user-site deployment.
- Astro `site`, canonical URLs, Open Graph URLs, sitemap URLs, manifest URLs, resume URLs, and internal links all use these settings.
- `.env.example` documents the two variables for local or hosted builds.

### Current GitHub user-site configuration

The intended production URL is:

```text
https://aadi11z.github.io/
```

The workflow uses `PUBLIC_SITE_URL=https://aadi11z.github.io` and an empty `PUBLIC_BASE_PATH`. Enable GitHub Pages with **GitHub Actions** as the source.

GitHub user sites require the repository to be named exactly `Aadi11z.github.io`. Rename the current `Aadi11z/website` repository to `Aadi11z.github.io` in GitHub repository settings before expecting the root URL to serve this build. Until that rename, GitHub will continue treating the repository as a project site under `/website`.

### GitHub user site

The workflow is already configured for the user site: `PUBLIC_BASE_PATH: ''` and `PUBLIC_SITE_URL: https://aadi11z.github.io`.

### Custom domain

Set `PUBLIC_SITE_URL` to the custom origin and leave `PUBLIC_BASE_PATH` empty. Add a `public/CNAME` file containing the domain if the hosting provider requires one. No CNAME is included because no custom domain was supplied.

### Cloudflare Pages or Vercel

Use:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 24 (Astro 7 requires Node 22.12 or newer)

Set both public environment variables to match the chosen origin and path. For a root deployment, use an empty `PUBLIC_BASE_PATH`.

The GitHub Pages workflow runs `npm ci`, `npm run check`, and `npm run build`, then uploads `dist` with the Pages deploy action.
