import { describe, expect, it } from 'vitest';
import {
	BlogManifestService,
	type FetchLike,
} from '@/domain/services/blog-manifest-service';
import { MarkdownArticleService } from '@/domain/services/markdown-article-service';
import type { BlogManifest } from '@/domain/models/blog';

const MANIFEST: BlogManifest = {
	version: 1,
	generatedAt: '2026-07-10T00:00:00.000Z',
	posts: [
		{
			title: 'Older',
			description: 'd',
			publishedAt: '2026-01-01',
			slug: 'older',
			locale: 'en',
			translationKey: 'older',
			tags: [],
			featured: false,
			path: '/content/blog/en/older.md',
		},
		{
			title: 'Newer',
			description: 'd',
			publishedAt: '2026-06-01',
			slug: 'newer',
			locale: 'en',
			translationKey: 'shared',
			tags: [],
			featured: false,
			path: '/content/blog/en/newer.md',
		},
		{
			title: 'Neuer',
			description: 'd',
			publishedAt: '2026-06-01',
			slug: 'neuer',
			locale: 'de',
			translationKey: 'shared',
			tags: [],
			featured: false,
			path: '/content/blog/de/neuer.md',
		},
	],
};

function fakeFetch(body: unknown, ok = true, status = 200): FetchLike {
	return () =>
		Promise.resolve({
			ok,
			status,
			json: () => Promise.resolve(body),
			text: () =>
				Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
		});
}

describe('BlogManifestService', () => {
	it('loads and validates a manifest', async () => {
		const manifest = await new BlogManifestService(fakeFetch(MANIFEST)).load();
		expect(manifest.posts).toHaveLength(3);
	});

	it('rejects failed requests', async () => {
		await expect(
			new BlogManifestService(fakeFetch({}, false, 503)).load(),
		).rejects.toThrow(/503/);
	});

	it('rejects invalid manifests', async () => {
		await expect(
			new BlogManifestService(fakeFetch({ version: 99, posts: [] })).load(),
		).rejects.toThrow(/invalid blog manifest/);
	});

	it('sorts locale posts newest first', () => {
		const posts = BlogManifestService.postsForLocale(MANIFEST, 'en');
		expect(posts.map((post) => post.slug)).toEqual(['newer', 'older']);
	});

	it('finds posts and translations', () => {
		const entry = BlogManifestService.findPost(MANIFEST, 'en', 'newer');
		expect(entry?.title).toBe('Newer');
		const translations = BlogManifestService.translationsOf(MANIFEST, entry!);
		expect(translations.map((post) => post.locale)).toEqual(['de']);
	});
});

describe('MarkdownArticleService', () => {
	const VALID = `---\ntitle: "T"\ndescription: "D"\npublishedAt: "2026-07-09"\nslug: "t"\nlocale: "en"\ntranslationKey: "t"\n---\n\nBody`;

	it('loads and parses a post', async () => {
		const post = await new MarkdownArticleService(fakeFetch(VALID)).load(
			'/content/blog/en/t.md',
		);
		expect(post.meta.title).toBe('T');
		expect(post.markdown.trim()).toBe('Body');
	});

	it('propagates malformed front matter as errors', async () => {
		await expect(
			new MarkdownArticleService(fakeFetch('---\ntitle x\n---\nbody')).load(
				'/content/blog/en/broken.md',
			),
		).rejects.toThrow();
	});

	it('propagates fetch failures', async () => {
		await expect(
			new MarkdownArticleService(fakeFetch('', false, 404)).load(
				'/content/blog/en/missing.md',
			),
		).rejects.toThrow(/404/);
	});
});
