---
title: 'Rebuilding josunlp.de: a static site with bQuery.js'
description: 'How this website is built: pre-rendered HTML, bQuery.js islands, a strict CSP, and a Markdown blog that works on plain static hosting.'
publishedAt: '2026-07-10'
updatedAt: '2026-07-10'
slug: 'rebuilding-josunlp-de'
locale: 'en'
translationKey: 'rebuilding-josunlp-de'
tags:
  - 'TypeScript'
  - 'bQuery.js'
  - 'Open Source'
draft: false
featured: true
---

This site is a complete rebuild. The previous version was a SvelteKit
single-pager; the new one is a set of pre-rendered HTML pages with a few
small interactive islands, built on [bQuery.js](https://bquery.js.org/),
TypeScript, and Tailwind CSS. This post walks through the architecture
and the trade-offs.

## Goals

The requirements were simple to state and pleasantly strict:

- Static files only — deployable to ordinary shared hosting
- Two languages (German and English) with crawlable, localized routes
- No trackers, no remote fonts, no third-party scripts
- A blog that accepts new Markdown files _without rebuilding the site_
- WCAG 2.2 AA as the accessibility target

## Rendering strategy

Every page is a typed TypeScript function that returns HTML. A build
script renders all routes to real `.html` files, and Vite bundles the
few client-side scripts with hashed names. The result is boring in the
best way: content is just HTML, and JavaScript only enhances it.

Interactivity is limited to islands, registered as Web Components:

| Island                 | Purpose                              |
| ---------------------- | ------------------------------------ |
| `jp-theme-toggle`      | light/dark/system switching          |
| `jp-site-nav`          | collapsible mobile navigation        |
| `jp-language-switcher` | persists an explicit language choice |
| `jp-blog-list`         | refreshes the list from the manifest |
| `jp-blog-article`      | renders posts uploaded after a build |

## The blog on a static host

The interesting constraint: new posts must appear without a rebuild.
The contract is a folder of Markdown files plus a generated manifest:

```text
/content/blog/
  index.json
  de/rebuilding-josunlp-de.md
  en/rebuilding-josunlp-de.md
```

Posts known at build time are pre-rendered as static HTML with full
metadata. Posts uploaded later are discovered through `index.json` and
rendered client-side by `jp-blog-article`:

```ts
const manifest = await new BlogManifestService(fetch).load();
const entry = BlogManifestService.findPost(manifest, locale, slug);
const post = await new MarkdownArticleService(fetch).load(entry.path);
```

> Markdown is treated as untrusted input, even though I write it
> myself. Everything passes through an allow-list sanitizer; raw HTML
> in Markdown is rendered as visible text, never as markup.

The honest trade-off: dynamically uploaded posts are not pre-rendered,
so their SEO depends on client-side rendering. For maximum visibility,
a post can always be added to the repository and shipped with the next
build instead.

## What I deliberately left out

- [x] Analytics — nothing to opt out of
- [x] Cookie banner — no consent-requiring technology ships
- [x] Contact form — a `mailto:` link needs no backend
- [ ] Comments — maybe one day, if it can be done privacy-first

---

The source is public: the repository is linked in the footer. If you
spot a problem — accessibility issues especially — please open an issue.
