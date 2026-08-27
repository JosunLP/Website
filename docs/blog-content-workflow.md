# Blog Content Workflow

How to write, validate, and publish blog posts — including publishing to
the live server **without rebuilding the site**.

## 1. Content contract

```text
content/blog/
  index.json          # generated manifest — never edit by hand
  de/<slug>.md        # German posts
  en/<slug>.md        # English posts
```

Three artifacts are generated from these files and must travel with
them: the manifest (`content/blog/index.json`), the blog sitemap
(`public/blog-sitemap.xml`), and the Atom feeds
(`public/{locale}/blog/feed.xml`). Reading time is derived from the
Markdown body at manifest-generation time — it is not front matter.

Rules enforced by the tooling:

- The file name must equal `<slug>.md` from the front matter.
- The folder must equal the front matter `locale`.
- Front matter is a strict YAML subset: `key: value` scalars (strings,
  `true`/`false`), quoted strings, and block lists of strings. Nested
  objects are rejected.

### Front matter template

```yaml
---
title: 'Example Post Title'
description: 'A concise SEO description.'
publishedAt: '2026-07-09'
updatedAt: '2026-07-09' # optional
slug: 'example-post'
locale: 'en'
translationKey: 'example-post' # same value across translations
tags:
  - 'TypeScript'
  - 'Open Source'
draft: false # true = excluded from manifest and build
featured: false
coverImage: '/assets/blog/example-cover.webp' # optional
coverImageAlt: 'Describe the image meaningfully.' # required with coverImage
canonicalUrl: '' # optional, for syndicated posts
---
```

### Supported Markdown

GFM: headings (stable, unique IDs; H2/H3 feed the table of contents,
which appears at ≥3 headings), paragraphs, links (external links open
hardened), ordered/unordered lists, task lists, blockquotes, tables
(horizontally scrollable), inline code and fenced code blocks with
highlighting (`ts`, `js`, `bash`, `json`, `rust`, `css`, `html`, `yaml`,
`md`), images (**alt text required — images without alt are dropped**),
horizontal rules.

Raw HTML inside Markdown is rendered as visible text, never as markup.
`javascript:` URLs, event handlers, iframes, and inline styles are
removed by the sanitizer.

## 2. Authoring workflow (with rebuild — best SEO)

1. Write `content/blog/{locale}/<slug>.md`. For a translation, use the
   same `translationKey` and a file in the other locale folder.
2. Optimize any referenced images and place them under `public/assets/blog/`.
3. Regenerate artifacts and verify:

   ```bash
   bun run generate:blog-manifest
   bun run generate:blog-sitemap
   bun run generate:blog-feeds
   bun run test
   bun run build && bun run validate
   bun run preview
   ```

4. Commit and deploy `dist/` as usual. The post is fully pre-rendered
   static HTML with complete metadata.

## 3. Manual upload workflow (no rebuild)

Posts uploaded after deployment are rendered client-side via the blog
shell. Uploading a post requires **all** of these steps:

1. Run the generators locally (they validate your front matter):

   ```bash
   bun run generate:blog-manifest
   bun run generate:blog-sitemap
   bun run generate:blog-feeds
   ```

2. Upload the Markdown file to
   `<webroot>/content/blog/{locale}/<slug>.md`.
3. Upload any referenced, optimized assets (e.g.
   `<webroot>/assets/blog/…`) — note that build assets are hashed, so
   post images should live under a stable path you upload yourself.
4. Upload the regenerated `content/blog/index.json` to
   `<webroot>/content/blog/index.json`.
5. Upload the regenerated `blog-sitemap.xml` to
   `<webroot>/blog-sitemap.xml`.
6. Upload the regenerated `public/{locale}/blog/feed.xml` to
   `<webroot>/{locale}/blog/feed.xml`. Skipping this leaves subscribers
   on a feed that never mentions the new post.
7. Optional: upload translations with the same `translationKey` (repeat
   steps 2–6 per locale).

Verify: open `/{locale}/blog/` (the list now shows the post) and
`/{locale}/blog/<slug>/` (the article renders).

### Requirements on the host

`/{locale}/blog/{slug}/` for a post that was never built must be
rewritten to `/{locale}/blog/_article/index.html` — see
[deployment.md](deployment.md) for Apache/nginx examples. Without the
rewrite, uploaded posts are reachable from the blog list only via the
shell URL, and deep links return 404.

### Honest trade-offs

- Uploaded posts are **not** pre-rendered: search engines that execute
  JavaScript can index them (the shell itself is `noindex`; the sitemap
  lists the canonical URL), but SEO is strictly weaker than for built
  posts. For content where SEO matters, prefer the rebuild workflow.
- Social-preview (Open Graph) tags for uploaded posts are injected
  client-side and will not be seen by most link-preview bots.
- The manifest is the single source of truth: a post that is uploaded
  but missing from `index.json` does not exist as far as the site is
  concerned.
