# Deployment

The build output in `dist/` is plain static files — HTML, hashed assets,
public content — deployable to any web server or shared hosting.

## 1. Build

```bash
bun install --frozen-lockfile
bun run check   # typecheck, lint, format, tests, build, validate
```

Upload the **contents of `dist/`** to the web root.

## 2. Required host configuration

| Concern       | Requirement                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Blog fallback | Rewrite unknown `/{de\|en}/blog/{slug}/` URLs to `/{locale}/blog/_article/index.html` (see examples) |
| 404           | Serve `/404.html` for unknown URLs (locale variants exist at `/de/404.html`, `/en/404.html`)         |
| MIME          | Serve `.md` as `text/markdown; charset=utf-8`, `.json` as `application/json`                         |
| Headers       | Apply the security headers from [security-headers.md](security-headers.md)                           |
| Caching       | `/assets/*` immutable (1 year); HTML, `content/*`, sitemaps, robots `no-cache`                       |

Reference configurations (review before use):

- Apache: [`examples/hosting/.htaccess`](../examples/hosting/.htaccess)
- nginx: [`examples/hosting/nginx.conf`](../examples/hosting/nginx.conf)

No particular hosting provider is assumed. On hosts without rewrite
support, the dynamic-upload blog workflow degrades: uploaded posts are
reachable from the blog index (client-side list refresh) but deep links
to them 404 — built posts are unaffected.

## 3. Directory layout in the web root

```
/                      index.html (locale decision), 404.html
/de/, /en/             prerendered pages
/de|en/blog/_article/  client-side article shell (noindex)
/assets/               hashed JS/CSS (immutable)
/content/blog/         Markdown + index.json (public content contract)
/images/               logos and other stable-path images
sitemap.xml, blog-sitemap.xml, robots.txt, favicons, site.webmanifest
```

## 4. Content uploads after deployment

Publishing a blog post without a rebuild is documented step by step in
[blog-content-workflow.md](blog-content-workflow.md).

## 5. Checks after deploying

1. `/` redirects to `/de/` or `/en/` (and shows visible links without JS).
2. `/de/`, `/en/` render with styles and the theme toggle appears.
3. `/en/blog/rebuilding-josunlp-de/` renders with code highlighting.
4. An unknown URL shows the 404 page.
5. An unknown blog slug (e.g. `/en/blog/does-not-exist/`) shows the
   shell's accessible "not found" state — this confirms the rewrite.
6. Response headers include the CSP and security headers.
7. `https://josunlp.de/sitemap.xml`, `/blog-sitemap.xml`, `/robots.txt`
   are reachable.
