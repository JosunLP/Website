import { describe, expect, it } from 'vitest';
import type { BlogManifestEntry } from '@/domain/models/blog';
import { MarkdownArticleService } from '@/domain/services/markdown-article-service';
import type { AssetResolver } from '@/render/layout';
import { buildRoutes, type SiteBlogData } from '@/render/site';

/**
 * Adjacent-post links exist so every article is reachable from another
 * article, not only from the index. The repository ships a single post
 * per locale, so the build never exercises this — these tests do.
 */

const ASSETS: AssetResolver = {
	script: (entry) => `/assets/${entry}.js`,
	styles: () => ['/assets/styles.css'],
	extraHead: () => '',
};

function markdown(slug: string, publishedAt: string, title: string): string {
	return `---
title: "${title}"
description: "Description of ${title}."
publishedAt: "${publishedAt}"
slug: "${slug}"
locale: "en"
translationKey: "${slug}"
tags:
  - "TypeScript"
draft: false
featured: false
---

Body text.
`;
}

/** Three English posts, oldest to newest. */
function blogData(): SiteBlogData {
	const sources = [
		markdown('oldest', '2026-01-01', 'Oldest'),
		markdown('middle', '2026-02-01', 'Middle'),
		markdown('newest', '2026-03-01', 'Newest'),
	];
	const posts = sources.map((source) => MarkdownArticleService.parse(source));
	const entries: BlogManifestEntry[] = posts
		.map((post) => ({
			...post.meta,
			path: `/content/blog/en/${post.meta.slug}.md`,
		}))
		// buildRoutes relies on the manifest order, which is newest first.
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
	return {
		entries,
		articles: new Map(
			posts.map((post) => [
				`en:${post.meta.slug}`,
				{ post, rendered: { html: '<p>Body text.</p>', toc: [] } },
			]),
		),
	};
}

function renderArticle(slug: string): string {
	const routes = buildRoutes(ASSETS, blogData());
	const render = routes.get(`/en/blog/${slug}/`);
	expect(render, `no route for ${slug}`).toBeDefined();
	return (render as () => string)();
}

describe('adjacent post navigation', () => {
	it('links both neighbours from a post in the middle', () => {
		const html = renderArticle('middle');
		expect(html).toContain('href="/en/blog/newest/"');
		expect(html).toContain('href="/en/blog/oldest/"');
		expect(html).toContain('Newer post');
		expect(html).toContain('Older post');
	});

	it('offers only the older neighbour on the newest post', () => {
		const html = renderArticle('newest');
		expect(html).toContain('href="/en/blog/middle/"');
		expect(html).not.toContain('Newer post');
		expect(html).toContain('Older post');
	});

	it('offers only the newer neighbour on the oldest post', () => {
		const html = renderArticle('oldest');
		expect(html).toContain('href="/en/blog/middle/"');
		expect(html).toContain('Newer post');
		expect(html).not.toContain('Older post');
	});

	it('omits the section entirely when a post stands alone', () => {
		const only = MarkdownArticleService.parse(
			markdown('only', '2026-01-01', 'Only'),
		);
		const routes = buildRoutes(ASSETS, {
			entries: [{ ...only.meta, path: '/content/blog/en/only.md' }],
			articles: new Map([
				['en:only', { post: only, rendered: { html: '<p>x</p>', toc: [] } }],
			]),
		});
		const html = (routes.get('/en/blog/only/') as () => string)();
		expect(html).not.toContain('Keep reading');
	});
});
