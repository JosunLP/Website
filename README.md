# josunlp.de

Personal portfolio and open-source presence of **Jonas Pfalzgraf
(JosunLP)** — a static, bilingual (German/English), privacy-first website
built with [bQuery.js](https://bquery.js.org/), TypeScript, and Tailwind
CSS.

## Purpose

- Present Jonas as a full-stack developer and open-source maintainer
- Showcase curated open-source projects, with bQuery.js as the flagship
- Publish a Markdown blog that works on plain static hosting — new posts
  can be uploaded without rebuilding the site
- Ship zero trackers, zero third-party requests, and WCAG 2.2 AA as the
  accessibility target

## Technology stack

| Concern      | Choice                                                                   |
| ------------ | ------------------------------------------------------------------------ |
| Framework    | bQuery.js (`component`, `reactive`, `i18n`, `a11y`, `security`, `media`) |
| Language     | TypeScript (strict)                                                      |
| Styling      | Tailwind CSS 4 with a design-token layer                                 |
| Build        | Vite (assets) + custom prerender pipeline (HTML)                         |
| Markdown     | marked + bQuery allow-list sanitization                                  |
| Highlighting | highlight.js core (blog chunk only)                                      |
| Tests        | Vitest (+ axe-core for accessibility)                                    |

See [docs/architecture/architecture.md](docs/architecture/architecture.md)
for the full picture.

## Prerequisites

- [Bun](https://bun.sh/) ≥ 1.2 (runtime, package manager, and TypeScript
  runner — `bun.lock` committed)

## Setup

```bash
bun install
```

## Development

```bash
bun run dev          # dev server at http://localhost:5173/
```

Pages are rendered on the fly through Vite's SSR pipeline; client islands
and styles are served by the regular Vite dev server.

### Auditing a preview

The dev server rewrites canonical, `hreflang`, `og:url` and the JSON-LD
`@id`s to the origin that served the request, so Lighthouse and similar
tools audit the preview instead of reporting "canonical points to a
different domain" for every page. Two caveats remain, both properties of
the preview rather than the site:

- **Forwarded ports must be public.** A private Codespaces port answers
  `/site.webmanifest` and `/robots.txt` with a 302 to `github.dev`, which
  surfaces as a CORS error in the console and an invalid `robots.txt` in
  the report.
- **Dev-server performance is not production performance.** Modules are
  unbundled and unminified with no compression. Measure performance
  against `bun run build && bun run preview` — but note that `preview`
  serves the real build, whose canonical URLs correctly name
  `josunlp.de`. A canonical finding there is the audit doing its job, not
  a defect.

So: audit **SEO** against `bun run dev`, and **performance** against
`bun run preview`. Restart the dev server after pulling changes to it —
the origin rewrite only applies to a server started afterwards.

## Build

```bash
bun run build        # social card + manifest + sitemaps + assets +
                     # prerendered HTML + precompression → dist/
bun run preview      # serve dist/ locally
```

The build fails on invalid project data or broken blog content — by
design.

Two build steps produce artefacts worth knowing about:

- `generate:og-image` draws `public/og-image.png` (1200×630) from the
  real logo geometry and the design tokens, with no image toolchain —
  see [scripts/generate-og-image.ts](scripts/generate-og-image.ts).
- `precompress` writes maximum-quality `.br` and `.gz` siblings for every
  text file in `dist/`, so a static host serves compressed bytes without
  spending CPU per request. Uploading them is optional.

## Quality checks

```bash
bun run typecheck        # strict TypeScript
bun run lint             # ESLint (typed rules)
bun run format:check     # Prettier (print width 80)
bun run test             # unit + component tests (Vitest)
bun run test:a11y        # axe-core checks on rendered pages
bun run validate         # dist/ link, metadata, sitemap, robots checks
bun run check            # all of the above + build
```

## Blog workflow

Posts are Markdown files with YAML front matter under
`content/blog/{de,en}/`. Regenerate the manifest, the blog sitemap, and
the per-locale Atom feeds after changes:

```bash
bun run generate:blog-manifest
bun run generate:blog-sitemap
bun run generate:blog-feeds
```

Articles link to their newer and older neighbour, so publishing a post
also changes the previously newest one — rebuild when that matters.

Posts can be published **without a rebuild** by uploading the Markdown
file and the regenerated `index.json`, `blog-sitemap.xml`, and
`{locale}/blog/feed.xml` to the server — the full procedure is documented
in [docs/blog-content-workflow.md](docs/blog-content-workflow.md).

## Deployment

`dist/` is plain static output deployable to any web server. Host
configuration examples (Apache/nginx), the blog URL rewrite, and security
headers are documented in [docs/deployment.md](docs/deployment.md) and
[docs/security-headers.md](docs/security-headers.md).

## Configuration

There are no environment variables. Site-wide values (origin, owner
contact data, navigation, storage keys) live in
[src/app/configuration.ts](src/app/configuration.ts).

## Documentation

- [Implementation plan](docs/architecture/implementation-plan.md)
- [Architecture](docs/architecture/architecture.md)
- [Blog content workflow](docs/blog-content-workflow.md)
- [Deployment](docs/deployment.md)
- [Security headers](docs/security-headers.md)
- [Owner actions required](docs/OWNER_ACTION_REQUIRED.md)
- [Implementation report](docs/IMPLEMENTATION_REPORT.md)

## License

MIT — see [LICENSE](LICENSE).
