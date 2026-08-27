// @vitest-environment jsdom
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import type { BlogManifestEntry } from '@/domain/models/blog';
import { renderMarkdown } from '@/domain/services/markdown';
import { messagesFor } from '@/features/i18n';
import type { AssetResolver } from '@/render/layout';
import { buildRoutes, type SiteBlogData } from '@/render/site';
import { MarkdownArticleService } from '@/domain/services/markdown-article-service';

/**
 * Automated accessibility checks (axe-core) against fully rendered
 * pages. Color-contrast is validated manually against the design tokens
 * because jsdom does not compute styles.
 */

const ASSETS: AssetResolver = {
	script: (entry) => `/assets/${entry}.js`,
	styles: () => ['/assets/styles.css'],
	extraHead: () => '',
};

const SAMPLE_MD = `---
title: "Sample"
description: "Sample description."
publishedAt: "2026-07-01"
slug: "sample"
locale: "en"
translationKey: "sample"
tags:
  - "TypeScript"
draft: false
featured: false
---

## Section one

Text with a [link](https://example.org/).

## Section two

More text.

## Section three

| a | b |
| - | - |
| 1 | 2 |
`;

function blogData(): SiteBlogData {
	const post = MarkdownArticleService.parse(SAMPLE_MD);
	const entry: BlogManifestEntry = {
		...post.meta,
		path: '/content/blog/en/sample.md',
	};
	return {
		entries: [entry],
		articles: new Map([
			[
				'en:sample',
				{
					post,
					rendered: renderMarkdown(post.markdown, {
						externalLinkLabel: messagesFor('en').externalLink,
					}),
				},
			],
		]),
	};
}

const routes = buildRoutes(ASSETS, blogData());

const REPRESENTATIVE_PATHS = [
	'/',
	'/en/',
	'/de/',
	'/en/about/',
	'/en/projects/',
	'/en/blog/',
	'/en/blog/sample/',
	'/en/contact/',
	'/de/imprint/',
	'/en/privacy/',
	'/en/accessibility/',
	'/en/404.html',
	'/en/blog/_article/',
];

async function runAxe(html: string): Promise<axe.AxeResults> {
	const bodyMatch = /<body>([\s\S]*)<\/body>/.exec(html);
	const langMatch = /<html lang="([a-z]{2})"/.exec(html);
	document.documentElement.setAttribute('lang', langMatch?.[1] ?? 'en');
	document.body.innerHTML = bodyMatch?.[1] ?? '';
	return axe.run(document.body, {
		rules: {
			// jsdom does not compute styles or layout.
			'color-contrast': { enabled: false },
		},
	});
}

describe('accessibility (axe-core)', () => {
	for (const path of REPRESENTATIVE_PATHS) {
		it(`${path} has no violations`, async () => {
			const render = routes.get(path);
			expect(render, `route ${path} must exist`).toBeDefined();
			const results = await runAxe(render!());
			const summary = results.violations.map(
				(violation) =>
					`${violation.id}: ${violation.nodes
						.map((node) => node.target.join(' '))
						.join(', ')}`,
			);
			expect(summary).toEqual([]);
		});
	}
});
