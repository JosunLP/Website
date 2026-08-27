# Implementation Plan — josunlp.de Rebuild

Date: 2026-07-10
Status: Approved for implementation

## 1. Goal

Replace the existing SvelteKit implementation of https://josunlp.de/ with a
new static, bilingual (de/en), privacy-first portfolio website built on
bQuery.js, TypeScript (strict), and Tailwind CSS. The site positions Jonas
Pfalzgraf (JosunLP) as a professional full-stack developer and open-source
maintainer, with bQuery.js as the flagship project.

## 2. Research summary

### Current site / repository

- SvelteKit 2 + Svelte 5 static site (`adapter-static`), SASS styling,
  single scroll page (greeting / about / contact) plus `imprint` and
  `datasecurity` routes, gaming-oriented copy (Discord, Twitch links).
- Owner-provided data worth carrying over (NOT invented):
  - Name: Jonas Pfalzgraf; postal contact: Postfach 7222, 22831 Norderstedt
  - E-mail: `info@josunlp.de` (general), `support@josunlp.de` (support)
  - GitHub: `JosunLP`; existing favicon set under `static/`
- Everything else (Svelte code, SASS, service worker, Playwright tests,
  web-vitals endpoint) is removed, not migrated.

### bQuery.js (verified 2026-07-10)

- Package `@bquery/bquery` v1.15.1, MIT, pure ESM, zero runtime deps,
  tree-shakeable module entry points, Node ≥ 24.
- Modules selected for this project:
  - `@bquery/bquery/component` — typed Web Components for interactive
    islands (theme toggle, language switcher, mobile nav, blog views).
  - `@bquery/bquery/reactive` — signals/effects for local component state.
  - `@bquery/bquery/i18n` — locale negotiation (`negotiateLocale`),
    dictionaries with interpolation/pluralization, `Intl` formatting.
  - `@bquery/bquery/a11y` — focus trap for the mobile menu, live-region
    announcements for async blog states.
  - `@bquery/bquery/security` — `sanitizeHtml` allow-list sanitization of
    rendered Markdown, `escapeHtml` for interpolated strings.
  - `@bquery/bquery/media` — `usePreferredColorScheme`, reduced-motion
    signal for the theme system.
- Modules deliberately NOT used: router/store/forms/view/motion/server/SSR
  runtime. Core content is pre-rendered static HTML; a client-side SPA
  router would harm SEO and resilience. The `view` module's `bq-*`
  directives require `unsafe-eval` (or a compile step) under CSP — rejected
  in favor of a strict CSP.

### Featured projects (verified from their repositories)

| Project                     | Tech                                       | License  | Status            |
| --------------------------- | ------------------------------------------ | -------- | ----------------- |
| bQuery.js                   | TypeScript framework                       | MIT      | Active, v1.15.1   |
| ThreadTS Universal          | TS parallelism lib (browser/Node/Deno/Bun) | MIT      | Active            |
| Sort It Now                 | Rust/Axum + Three.js 3D bin packing        | see repo | Active, v1.5.0    |
| UserScript Project Template | TS/Vite userscript starter                 | MIT      | Active            |
| Browser Extension Template  | TS/Vite/bQuery extension starter           | MIT      | Active            |
| CheckAI                     | Rust chess engine + APIs + web UI          | MIT      | Active, v0.8.0    |
| Planning Poker              | Nuxt 4/TS/Tailwind estimation tool         | MIT      | Active, live demo |
| Retro Rumble                | Nuxt 4/TS/Tailwind retro tool              | MIT      | Active            |

### Tooling versions (Bun, 2026-07-10)

- `@bquery/bquery` 1.15.1, `tailwindcss` + `@tailwindcss/vite` 4.3.2,
  `vite` 8.1.4, `vitest` 4.x, `typescript` latest 7.0.2 (fallback pin
  5.9.x only if the toolchain proves incompatible — documented if so),
  `eslint` 10.x, `prettier` 3.9.x (print width 80), `tsx` for scripts.
- Markdown: `marked` (lightweight, maintained, zero-dep) for parsing only;
  all output passes through `@bquery/bquery/security` sanitization.
  `highlight.js/lib/core` with a small language subset, loaded only on
  article pages, for code highlighting.
- Package manager & runtime: Bun (install, script running, and native
  TypeScript execution for the build/prerender scripts).

## 3. Architecture decisions

### Rendering strategy: build-time pre-rendering + interactive islands

1. Pages are typed TypeScript render functions returning HTML strings
   (data-driven, escaped by default).
2. `scripts/prerender.ts` writes every locale route as a real `.html` file;
   Vite builds them as multi-page inputs with hashed assets.
3. A small client bundle registers `jp-*` Web Components (bQuery
   `component`) that progressively enhance the static HTML: theme toggle,
   language switcher, mobile navigation, blog manifest loading, Markdown
   article rendering.
4. Core content never depends on client-side JS or runtime API calls.

### Routes

```
/                      → locale decision page (meta refresh + tiny script + visible links)
/{de|en}/              → home
/{de|en}/about/
/{de|en}/projects/
/{de|en}/projects/{slug}/
/{de|en}/blog/
/{de|en}/blog/{slug}/  → pre-rendered for build-time posts; client-side
                          shell (`article/index.html` rewrite) for posts
                          uploaded after deployment
/{de|en}/contact/
/{de|en}/imprint/
/{de|en}/privacy/
/{de|en}/accessibility/
/404.html              → locale-aware error page
```

### Blog on a static host

- Public contract: `/content/blog/index.json` manifest +
  `/content/blog/{de|en}/{slug}.md` files with YAML front matter.
- Build-time posts are fully pre-rendered (HTML + metadata + JSON-LD).
- Posts uploaded post-deployment are discovered via the manifest and
  rendered client-side by the blog shell (`.htaccess`/nginx rewrite
  examples provided). Trade-off documented: dynamically uploaded posts are
  not pre-rendered HTML; SEO metadata for them is client-injected.
- `scripts/generate-blog-manifest.ts` and
  `scripts/generate-blog-sitemap.ts` produce the manifest and
  `blog-sitemap.xml`; both are validated by unit tests.
- Front matter is parsed by a small strict parser limited to the
  documented schema (strings, ISO dates, booleans, string lists) and
  validated at runtime; malformed content yields accessible error states.
- Markdown → `marked` → allow-list sanitization → DOM. No inline styles,
  no event handlers, no `javascript:` URLs, no iframes, no scripts.

### i18n

- Typed dictionaries per locale (`src/locales/de`, `src/locales/en`),
  compile-time key safety via a shared `Messages` interface.
- bQuery `i18n` for negotiation, interpolation, plurals; `Intl` for dates.
- Root `/` decision: stored preference (strictly necessary, only set after
  explicit user choice) → `negotiateLocale(navigator.languages)` → `de`.
- `hreflang` de/en/x-default on every page; language switcher in header and
  footer preserving the equivalent route; no flags as language labels.
- Adding a locale = add dictionary + content files + register in
  `src/app/configuration.ts` (documented).

### Design

- Original identity: calm, editorial, "modular systems" motif — a
  restrained geometric grid/node SVG pattern (static, decorative,
  `aria-hidden`), strong type hierarchy using a system font stack
  (documented: zero-download typography beats a self-hosted webfont for
  CWV and privacy; revisit if branding demands it).
- Tailwind CSS 4 with a design-token layer in `@theme` (colors, spacing,
  radii, shadows, motion durations); light/dark via `prefers-color-scheme`
  default plus explicit user override persisted only on user action.
- Motion: micro-transitions only, fully disabled under
  `prefers-reduced-motion`.

### Quality gates

`typecheck`, `lint`, `format:check`, `test` (Vitest: domain services,
front-matter/manifest validation, sanitizer behavior, locale negotiation,
route mapping, component behavior), `test:a11y` (axe-core against
pre-rendered pages), `validate` (internal link check, sitemap/robots/
metadata/structured-data checks over `dist/`), production build smoke test.

## 4. Work breakdown

1. Remove Svelte implementation; scaffold Vite + TS strict + Tailwind 4 +
   bQuery; keep favicons and repository meta files.
2. Domain layer: models (`Project`, `BlogPost`, `BlogManifest`, `Locale`,
   `PageMeta`), services (`BlogManifestService`, `MarkdownArticleService`,
   `SeoService`, i18n helpers), curated project data (de/en).
3. Component system (`jp-*`): header/nav, footer, skip link, theme toggle,
   language switcher, section heading, buttons, project card, tech tags,
   blog card, article layout, TOC, callout, external-link handling, async
   empty/loading/error states.
4. Pages + pre-render pipeline + SEO artifacts (sitemaps, robots,
   structured data, canonical/hreflang/OG/Twitter).
5. Blog pipeline: manifest/sitemap generators, sample posts (de + en),
   client-side article shell, host rewrite examples.
6. Tests + a11y checks + validation scripts.
7. Documentation set + legal templates with explicit placeholders +
   `OWNER_ACTION_REQUIRED.md` + final implementation report.

## 5. Explicit non-goals

- No analytics, trackers, cookie banner (nothing consent-requiring ships).
- No contact form (mailto links only, privacy-first).
- No GitHub API calls at runtime; project metadata is curated locally.
- No gaming-focused content or visual identity.
