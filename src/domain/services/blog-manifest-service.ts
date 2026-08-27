import {
	validateManifest,
	type BlogManifest,
	type BlogManifestEntry,
} from '@/domain/models/blog';
import type { Locale } from '@/domain/models/locale';

/** Minimal fetch-like dependency, injectable for tests. */
export type FetchLike = (url: string) => Promise<{
	ok: boolean;
	status: number;
	json(): Promise<unknown>;
	text(): Promise<string>;
}>;

export const BLOG_MANIFEST_URL = '/content/blog/index.json';

/**
 * Loads and validates the public blog manifest. The manifest is the
 * single source of truth for which posts exist at runtime — including
 * posts uploaded to the server after the site was built.
 */
export class BlogManifestService {
	constructor(private readonly fetchFn: FetchLike) {}

	async load(): Promise<BlogManifest> {
		const response = await this.fetchFn(BLOG_MANIFEST_URL);
		if (!response.ok) {
			throw new Error(
				`manifest request failed with status ${String(response.status)}`,
			);
		}
		const data: unknown = await response.json();
		const errors = validateManifest(data);
		if (errors.length > 0) {
			throw new Error(`invalid blog manifest: ${errors.join('; ')}`);
		}
		return data as BlogManifest;
	}

	/** Published posts for a locale, newest first. */
	static postsForLocale(
		manifest: BlogManifest,
		locale: Locale,
	): BlogManifestEntry[] {
		return manifest.posts
			.filter((post) => post.locale === locale)
			.slice()
			.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
	}

	/** Finds a post by locale and slug. */
	static findPost(
		manifest: BlogManifest,
		locale: Locale,
		slug: string,
	): BlogManifestEntry | undefined {
		return manifest.posts.find(
			(post) => post.locale === locale && post.slug === slug,
		);
	}

	/** Translations of a post (same translationKey, other locales). */
	static translationsOf(
		manifest: BlogManifest,
		entry: BlogManifestEntry,
	): BlogManifestEntry[] {
		return manifest.posts.filter(
			(post) =>
				post.translationKey === entry.translationKey &&
				post.locale !== entry.locale,
		);
	}
}
