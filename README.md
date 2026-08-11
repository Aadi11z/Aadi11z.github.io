# Aaditya Bhatnagar — Portfolio

A static technical portfolio for Aaditya Bhatnagar. The site presents a concise professional profile, topic-grouped projects, research and paper references, production experience, original technical SVGs, native page transitions, and small interactive research tools.

## Stack

- Astro 7 static-site generation
- TypeScript and native `.astro` components
- Typed content modules in `src/data/`
- Modular tokenized CSS in `src/styles/`
- Native browser JavaScript for navigation, theme preference, and explorers
- No backend, CMS, client framework, remote font, or animation library

Node 24 is pinned in `.node-version` for CI and Cloudflare Pages.

## Local development

```bash
npm ci
npm run dev
```

Open `http://localhost:4321/`. Local development uses the root path unless `PUBLIC_BASE_PATH` is explicitly set.

The mechanical-keyboard intro has two modes:

```bash
npm run dev
npm run dev:design
```

- `npm run dev` is the normal visitor flow. The intro waits for a click or letter-key gesture, wakes the RGB scene, types the name from one deterministic keystroke sequence, and automatically presses Enter after a short pause. The name then transitions into the real Overview heading.
- `npm run dev:design` is the animation-debug flow. It ignores visit persistence, runs the same keyboard sequence, and holds on the completed keyboard. Enter previews its impact without opening Overview, so key travel and lighting can be inspected repeatedly.

`npm run build` always defaults to normal production mode. Restart the development server when switching modes.

Normal mode records a completed or skipped intro under `aaditya-portfolio-intro-v2` in browser `sessionStorage`. It stays skipped through navigation and refreshes in the same browsing session, then becomes eligible again in a new browser session. The pre-paint gate reads that value before rendering, so returning visitors do not see a flash of the intro. Design mode ignores and does not update the session value.

The intro never traps access to the portfolio:

- `Skip intro`, Escape, and `?intro=skip` immediately leave the scene in a valid Overview state.
- The first Begin, letter-key, or Enter gesture attempts to unlock Web Audio. Animation continues silently if sound is blocked, unavailable, or still decoding.
- `Sound on / off` persists separately in `localStorage`; muting does not affect animation timing.
- With `prefers-reduced-motion: reduce`, the final name is shown immediately, key/glow movement is minimized, and the visitor can press Enter or skip without watching the typing sequence.
- Native View Transitions morph the typed name toward the Overview title when supported. The CSS fallback preserves the same valid final state without a client router.

Design mode exposes a development-only `window.__keyboardIntroDebug` API:

```js
window.__keyboardIntroDebug.state
window.__keyboardIntroDebug.start()
window.__keyboardIntroDebug.enter()
window.__keyboardIntroDebug.replay()
window.__keyboardIntroDebug.pressKey('KeyA')
window.__keyboardIntroDebug.releaseKey('KeyA')
window.__keyboardIntroDebug.releaseAll()
window.__keyboardIntroDebug.skip()
```

The key identifiers follow `KeyboardEvent.code`, including `ShiftLeft`, `Space`, and `Enter`.

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

Keyboard audio is generated from deterministic, repository-owned synthesis code:

```bash
npm run generate:keyboard-audio
```

This command requires `ffmpeg` with the `libopus` encoder. It recreates four normal-key variants plus distinct Space and Enter samples as mono 48 kHz WebM/Opus assets. Source and licensing details live in `src/assets/audio/keyboard/PROVENANCE.md`; no third-party recordings are used.

To test a GitHub project-site base path:

```bash
PUBLIC_SITE_URL=https://aadi11z.github.io PUBLIC_BASE_PATH=website npm run build
PUBLIC_SITE_URL=https://aadi11z.github.io PUBLIC_BASE_PATH=website npm run generated-check
```

The deployment workflow runs this base-path build in a separate verification job. That job never uploads a Pages artifact, so the root-path production artifact remains isolated.

## Content editing

- `src/data/profile.ts` — identity, professional profile copy, contact, and social links
- `src/data/projects.ts` — topic-grouped project records, evidence, and detail sections
- `src/data/research.ts` — research projects and primary paper references
- `src/data/experience.ts` — professional experience with its public LinkedIn source
- `src/data/playgrounds/unlearning.ts` — measured machine-unlearning explorer data

Project links are optional. Add `liveUrl`, `repositoryUrl`, or `reportUrl` only when the public URL is real. A project receives a static detail page when it has a `detail` object in `src/data/projects.ts`.

Explorer observations require an explicit provenance value. Missing experiment results must remain unavailable rather than being estimated or interpolated.

## Presentation architecture

- `src/components/intro/KeyboardIntro.astro` — accessible intro shell, typed name, live status, and scene composition
- `src/components/intro/KeyboardScene.astro` — one decorative DOM key per physical key, generated from layout data rather than hand-authored markup
- `src/components/intro/IntroControls.astro` — Begin, persistent sound preference, and skip controls with non-JavaScript fallback URLs
- `src/data/keyboard-layout.ts` — typed compact-keyboard geometry, realistic key widths, RGB hue placement, and physical-neighbor metadata
- `src/data/intro-sequence.ts` — the single causal typing timeline for Shift chords, letters, Space, holds, gaps, and final Enter timing
- `src/scripts/intro/keyboard-controller.ts` — independently addressable physical/script/debug key mechanics, neighbor spill, and cleanup
- `src/scripts/intro/intro-controller.ts` — cancellable intro state machine, text synchronization, session handling, reduced motion, skip behavior, and transition completion
- `src/scripts/intro/audio-engine.ts` — gesture-gated Web Audio decoding, four normal-key variations, distinct Space/Enter playback, voice limiting, and mute persistence
- `src/styles/keyboard-intro.css` — CSS 3D chassis and keycaps, static ambient gradients, local RGB pulses, responsive scaling, and reduced-motion states
- `src/assets/audio/keyboard/` — six original compressed keyboard samples and their provenance
- `src/components/visuals/` — original project SVG illustrations
- `src/components/playgrounds/` — progressively enhanced static explorers
- `src/styles/tokens.css` — cream/light and black-blue/dark theme tokens, spacing, and type
- `src/styles/global.css` — reset, typography, and shared utilities
- `src/styles/layout.css` — navigation, footer, résumé, and 404 layouts
- `src/styles/hero.css` — Overview composition and hero typography
- `src/styles/home.css` — homepage gate, sections, and intro-to-Overview transition
- `src/styles/projects.css` — archive, project cards, and case studies
- `src/styles/research.css` — research-project and paper-card presentation
- `src/styles/playgrounds.css` — explorer and lab layouts
- `src/styles/effects.css` — reduced motion, reveals, and native View Transitions

Theme follows the user’s system setting on first visit and persists a manual light/dark choice in `localStorage`. Motion follows the operating system’s reduced-motion preference without a site-level control. Important content is rendered during the Astro build and remains available without JavaScript.

### Keyboard rendering and performance

The keyboard remains framework-free: no hydrated client island, Canvas, WebGL, Three.js, image-based keyboard, or animation runtime. Astro emits a single scene with 67 non-interactive key elements; pseudo-elements supply top faces, keycap depth, legends, and light leakage. Large ambient gradients are mostly static, while interaction is limited to small-element transforms, opacity, and local intensity changes.

The production budget gate enforces aggregate limits of 50 KiB gzip for CSS, 50 KiB gzip for JavaScript, and 200 KiB for any individual image. Intro-specific targets keep the intro JavaScript below 15 KiB compressed, keyboard audio below 150 KiB total, and keyboard markup below 100 physical key elements. Run `npm run budget-check` only after a production build; `npm run validate` includes it automatically.

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
- `PUBLIC_INTRO_MODE` — `normal` for production; `design` only for deliberate animation inspection

These values control canonical URLs, sitemap URLs, Open Graph URLs, the web manifest, résumé links, assets, and internal navigation.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds with Node 24, runs normal-mode validation, uploads that root-path `dist`, and deploys the `main` branch. A separate job also validates a representative `/website` project-site base path without uploading or replacing the deployment artifact.

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
