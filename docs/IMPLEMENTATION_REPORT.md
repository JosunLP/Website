# Implementation Report — josunlp.de Rebuild

Date: 2026-07-10

## What was implemented

Complete replacement of the SvelteKit site with a static, bilingual
(de/en), privacy-first portfolio built on bQuery.js 1.15.1, strict
TypeScript, and Tailwind CSS 4:

- 23 pre-rendered pages: root locale decision, per-locale home, about,
  projects, blog index, blog articles, contact, imprint, privacy,
  accessibility statement, 404, and the blog article shell.
- Data-driven project showcase (8 verified OSS projects, bQuery.js as
  flagship with its logo; owner logo in header/root page).
- Markdown blog with a validated public manifest, safe rendering, code
  highlighting, TOC, translations linking, and a documented no-rebuild
  upload workflow (2 polished sample posts, de + en).
- Full SEO artifact set, WCAG 2.2 AA-targeted accessibility, strict-CSP
  security posture, and a reproducible quality pipeline.

## bQuery.js modules used and why

- `component` — typed Web Components for the self-rendering islands
  (`jp-theme-toggle`, `jp-blog-article`).
- `reactive` — signals driving component re-renders.
- `i18n` — browser-language negotiation on the root route; dictionary
  instance factory.
- `a11y` — mobile-menu focus trap, screen-reader announcements.
- `security` — allow-list HTML sanitization of all Markdown output.
- `media` — reactive `prefers-color-scheme` signal for the theme system.

Not used (documented in architecture.md): `router`/`store`/`view`/
`ssr`-runtime/`server`/`forms`/`motion` — no SPA, no backend, no forms;
the `view` directives would require `unsafe-eval` under CSP.

## Dependencies added and why

Runtime: `@bquery/bquery` (required framework), `marked` (lightweight
maintained Markdown parser — parsing only, output always sanitized),
`highlight.js` (code highlighting; core build + 9 languages, loaded only
by the blog chunk). Dev: Vite 8 + `@tailwindcss/vite`, Tailwind CSS 4,
TypeScript 5.9 (pinned: typescript-eslint does not yet support TS 7),
Vitest 4, happy-dom + jsdom (test DOMs), axe-core (a11y tests),
ESLint 10 with typescript-eslint, Prettier 3 (print width 80), and tsx
(script runner).

## How to add or edit projects

Edit `src/content/projects.ts` — typed `Project` records with de/en
descriptions, technologies, category, status, license, links, and
`featured`/`flagship` flags. `npm run test` and the build validate the
data (slugs, https URLs, non-empty localized copy). Cards, the flagship
section, and JSON-LD update automatically.

## How to publish a blog article manually

Short version (details in `docs/blog-content-workflow.md`): write
`content/blog/{locale}/<slug>.md` with the documented front matter, run
`npm run generate:blog-manifest && npm run generate:blog-sitemap`, then
upload the `.md` file, `content/blog/index.json`, `blog-sitemap.xml`, and
any referenced assets. For maximum SEO, prefer committing the post and
rebuilding instead.

## Static-host configuration required

- Rewrite unknown `/{de|en}/blog/{slug}/` → `/{locale}/blog/_article/index.html`
- 404 → `/404.html`; `.md` served as `text/markdown`
- Security headers incl. CSP with the theme-init hash
  (`npm run generate:csp-hash`)
- Immutable caching for `/assets/`, `no-cache` for HTML/content
- Examples: `examples/hosting/.htaccess`, `examples/hosting/nginx.conf`

## Outstanding owner actions / legal review

See `docs/OWNER_ACTION_REQUIRED.md`. Highlights: verify imprint address
sufficiency, name hosting provider + supervisory authority in the privacy
policy, perform manual a11y tests, have legal pages reviewed — they ship
as clearly marked draft templates with visible `[[OWNER: …]]`
placeholders. No personal/legal data was invented.

## Test and build results (2026-07-10)

| Check                  | Result                             |
| ---------------------- | ---------------------------------- |
| `npm run typecheck`    | ✅ clean (strict)                  |
| `npm run lint`         | ✅ 0 problems                      |
| `npm run format:check` | ✅ clean                           |
| `npm run test`         | ✅ 86/86 (9 files)                 |
| `npm run test:a11y`    | ✅ 13 pages, 0 axe violations      |
| `npm run build`        | ✅ 23 pages + hashed assets        |
| `npm run validate`     | ✅ 24 HTML files, sitemaps, robots |

Bundle: bootstrap ~8.7 kB (3.4 kB gzip), styles ~26 kB (5.5 kB gzip);
blog chunk ~114 kB (36 kB gzip) loaded on blog routes only. No remote
requests of any kind at runtime except same-origin content fetches.

## Known limitations

- **Dynamic-blog SEO trade-off**: posts uploaded without a rebuild are
  client-rendered; link-preview bots and non-JS crawlers see only the
  shell (noindex) — the blog sitemap carries the canonical URL. Built
  posts have full static HTML. This is inherent to "new content on a
  static host without rebuild" and documented for authors.
- Locale-aware 404s need host support; the default is the German 404
  with visible language links.
- TypeScript is pinned to 5.9.x until typescript-eslint supports TS 7.
- Color-contrast checking is manual (design tokens) — jsdom cannot
  compute styles; a browser-based Lighthouse/axe pass on the deployed
  site is recommended.
- Legal pages are drafts pending owner/legal review (visible notice).
