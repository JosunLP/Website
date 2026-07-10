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

- Node.js ≥ 24
- npm (lockfile committed)

## Setup

```bash
npm install
```

## Development

```bash
npm run dev          # dev server at http://localhost:5173/
```

Pages are rendered on the fly through Vite's SSR pipeline; client islands
and styles are served by the regular Vite dev server.

## Build

```bash
npm run build        # manifest + sitemaps + assets + prerendered HTML → dist/
npm run preview      # serve dist/ locally
```

The build fails on invalid project data or broken blog content — by
design.

## Quality checks

```bash
npm run typecheck        # strict TypeScript
npm run lint             # ESLint (typed rules)
npm run format:check     # Prettier (print width 80)
npm run test             # unit + component tests (Vitest)
npm run test:a11y        # axe-core checks on rendered pages
npm run validate         # dist/ link, metadata, sitemap, robots checks
npm run check            # all of the above + build
```

## Blog workflow

Posts are Markdown files with YAML front matter under
`content/blog/{de,en}/`. Regenerate the manifest and blog sitemap after
changes:

```bash
npm run generate:blog-manifest
npm run generate:blog-sitemap
```

Posts can be published **without a rebuild** by uploading the Markdown
file, the regenerated `index.json`, and `blog-sitemap.xml` to the server —
the full procedure is documented in
[docs/blog-content-workflow.md](docs/blog-content-workflow.md).

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
