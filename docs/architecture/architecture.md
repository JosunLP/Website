# Architecture — josunlp.de

Status: implemented 2026-07-10. Companion to
[implementation-plan.md](implementation-plan.md).

## 1. Rendering strategy

The site is **pre-rendered static HTML with interactive islands**:

1. Every page is a pure TypeScript render function
   (`src/render/pages/*`) that turns typed data into escaped HTML via a
   small tagged-template helper (`src/utils/html.ts`).
2. `src/render/site.ts` maps every route of the site to a renderer.
3. `vite build` bundles the client entries with hashed names and writes a
   manifest; `scripts/prerender.ts` then renders all routes to real
   `.html` files in `dist/`, resolving asset URLs from that manifest.
4. A small client bundle registers `jp-*` Web Components that enhance the
   static markup. Core content never depends on JavaScript or runtime API
   calls.

Why not SPA routing or bQuery SSR at runtime: crawlable, resilient,
CSP-strict HTML beats client rendering for a portfolio, and there is no
server. The bQuery `view` directive system was rejected because it needs
`unsafe-eval` (or a compile step) under CSP.

Build order: `generate:blog-manifest` → `generate:blog-sitemap` →
`vite build` → `prerender` → `postbuild` (copy `content/blog/`, root
sitemap, top-level 404).

## 2. bQuery.js module usage

| Module                     | Used for                                                             |
| -------------------------- | -------------------------------------------------------------------- |
| `@bquery/bquery/component` | `jp-theme-toggle`, `jp-blog-article` (typed props/state islands)     |
| `@bquery/bquery/reactive`  | signals backing component re-renders (via `signals` option)          |
| `@bquery/bquery/i18n`      | `negotiateLocale` for the root locale decision; `createI18n` factory |
| `@bquery/bquery/a11y`      | `trapFocus` (mobile menu), `announceToScreenReader` (async updates)  |
| `@bquery/bquery/security`  | `sanitizeHtml` allow-list for all Markdown output                    |
| `@bquery/bquery/media`     | `usePreferredColorScheme` signal for the theme system                |

Not used: `router`, `store`, `forms`, `view`, `motion`, `server`, `ssr`
runtime — no SPA, no forms, no backend, and motion is CSS-only.

**Component conventions.** Two island styles, both light-DOM
(`shadow: false`) so the Tailwind design system applies:

- _Self-rendering islands_ (bQuery `component()`): render their own UI
  from typed props/state — `jp-theme-toggle`, `jp-blog-article`.
- _Enhancer elements_ (plain `customElements.define`): wrap
  server-rendered, crawlable markup they must never re-render —
  `jp-site-nav`, `jp-language-switcher`, `jp-blog-list`. Child-dependent
  setup is deferred one microtask because `connectedCallback` can fire
  before children are attached.

All custom elements use the `jp-` prefix. Interactive controls are
keyboard accessible, ≥44px touch targets, no hover-only content.

## 3. Source layout

```
src/
  app/            configuration, route helpers, client entries
  components/     jp-* Web Components (client only)
  content/        curated data: projects, skills, legal templates
  domain/
    models/       Locale, Project, Blog* types + validation
    services/     seo, front-matter, markdown, blog manifest/article
  features/       i18n, theme, blog highlighting
  locales/        typed dictionaries (de, en)
  render/         layout, ui partials, pages, site route map
  styles/         Tailwind + design tokens
  utils/          html templating
scripts/          build pipeline (prerender, generators, validate, dev)
content/blog/     public Markdown content + generated manifest
public/           static assets (favicons, logos, robots, blog sitemap)
tests/            Vitest suites incl. tests/a11y (axe-core)
examples/hosting/ Apache/nginx reference configs
```

## 4. Content model

- **Projects** (`src/content/projects.ts`): typed `Project` records with
  localized descriptions, curated by hand and validated at build time.
  No GitHub API at runtime (rate limits, privacy, SEO stability).
- **Pages**: copy lives in typed locale dictionaries; legal pages are
  structured `LegalPageContent` templates with explicit `[[OWNER: …]]`
  placeholders.
- **Blog**: Markdown + YAML front matter under `content/blog/{locale}/`;
  public contract documented in
  [../blog-content-workflow.md](../blog-content-workflow.md).

## 5. Localization model

- Locales: `de` (default), `en`. `src/domain/models/locale.ts` is the
  single registration point; every consumer is typed against it, so
  adding a locale is compiler-guided (dictionary, project copy, legal
  content, `LOCALES` entry).
- All UI copy comes from `AppMessages` dictionaries — a missing key is a
  compile error, which is the fallback policy for UI copy. Runtime
  fallback (bQuery i18n `fallbackLocale`) exists for defense in depth.
- `Intl.DateTimeFormat` for dates; interpolation/plurals via the same
  `{param}` / `one | many` syntax bQuery i18n uses.
- Routes are locale-prefixed (`/de/…`, `/en/…`) with identical segments,
  so the language switcher maps routes 1:1. `hreflang` (de, en,
  x-default→de) on every indexable page.
- Root `/`: stored explicit preference → `negotiateLocale(navigator
.languages)` → German; visible language links work without JS.

## 6. Blog model

- `content/blog/index.json` (generated, validated, versioned) is the
  runtime source of truth; `BlogManifestService` loads and validates it.
- Build-time posts are fully pre-rendered (HTML, metadata, JSON-LD,
  highlighting) — best SEO path.
- Posts uploaded after deployment are discovered via the manifest:
  `jp-blog-list` refreshes the index, and the host rewrites unknown
  `/{locale}/blog/{slug}/` URLs to the pre-rendered shell
  `/{locale}/blog/_article/` where `jp-blog-article` fetches, validates,
  sanitizes, and renders the Markdown. The shell is `noindex`; the
  generated `blog-sitemap.xml` (uploaded with the post) makes the
  canonical URL discoverable.
- Front matter is parsed by a strict, dependency-free subset parser
  (`front-matter.ts`) and validated (`blog.ts`); malformed content
  produces accessible error states, never crashes.

## 7. SEO model

- One `h1` per page, semantic landmarks, localized titles and meta
  descriptions, canonical URLs, `hreflang`, Open Graph, Twitter Cards.
- JSON-LD: `Person`, `WebSite`, `WebPage`, `BreadcrumbList`,
  `SoftwareSourceCode` (projects), `Blog`, `BlogPosting` — all generated
  from the same typed data as the visible content.
- `sitemap.xml` (static pages, generated in postbuild) +
  `blog-sitemap.xml` (generated from Markdown sources) + `robots.txt`
  referencing both. `noindex` on the 404 pages and the article shell.
- `scripts/validate-dist.ts` enforces all of this on every build.

## 8. Accessibility strategy

Target: WCAG 2.2 AA. Implemented: skip link, visible focus indicators,
full keyboard support, focus trap only while the mobile menu is open
(Escape closes), `aria-current` navigation state, unique landmarks,
correct heading order, live-region announcements for async blog states,
reduced-motion respected globally, no positive tabindex, text-plus-dot
status badges (no color-only meaning). Automated: axe-core against
rendered representative pages (`tests/a11y`). Color contrast is validated
against the design tokens manually since jsdom computes no styles; the
accessibility statement documents remaining limitations honestly.

## 9. Security and privacy decisions

- Markdown is untrusted: `marked` renders with raw HTML escaped to text,
  then everything passes bQuery `sanitizeHtml` (allow-list; no scripts,
  no event handlers, no `javascript:` URLs, no iframes, no inline
  styles). Component render output is sanitized again by bQuery itself.
- Strict CSP (no `unsafe-inline` for scripts): the only inline script is
  the byte-stable theme bootstrap, allowed via SHA-256 hash
  (`bun run generate:csp-hash`). See
  [../security-headers.md](../security-headers.md).
- External links: `rel="noopener noreferrer"` (build-validated).
- No analytics, no cookies, no consent-requiring tech, no third-party
  requests; fonts are system-stack (documented trade-off: zero-download
  typography beats a webfont for CWV and privacy).
- Local preferences (`jp:locale`, `jp:theme`) are stored only after an
  explicit user action and documented in the privacy policy.

## 10. Deployment and content-upload workflow

See [../deployment.md](../deployment.md) (host setup, rewrites, caching)
and [../blog-content-workflow.md](../blog-content-workflow.md)
(publishing posts without a rebuild).
