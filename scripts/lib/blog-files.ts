import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { BlogManifestEntry, BlogPost } from '@/domain/models/blog';
import { LOCALES, type Locale } from '@/domain/models/locale';
import { MarkdownArticleService } from '@/domain/services/markdown-article-service';
import { estimateReadingMinutes } from '@/domain/services/reading-time';

export const CONTENT_BLOG_DIR = join(process.cwd(), 'content', 'blog');

export interface LoadedPost {
	readonly post: BlogPost;
	readonly locale: Locale;
	/** Public path of the Markdown file. */
	readonly publicPath: string;
	readonly fileName: string;
}

/**
 * Loads and validates all Markdown posts from `content/blog/{locale}/`.
 * Invalid files fail loudly — broken content must never ship silently.
 */
export function loadAllPosts(): LoadedPost[] {
	const posts: LoadedPost[] = [];
	for (const locale of LOCALES) {
		const dir = join(CONTENT_BLOG_DIR, locale);
		if (!existsSync(dir)) {
			continue;
		}
		for (const fileName of readdirSync(dir)) {
			if (!fileName.endsWith('.md')) {
				continue;
			}
			const source = readFileSync(join(dir, fileName), 'utf8');
			let post: BlogPost;
			try {
				post = MarkdownArticleService.parse(source);
			} catch (error) {
				throw new Error(
					`content/blog/${locale}/${fileName}: ${String(error)}`,
					{
						cause: error,
					},
				);
			}
			if (post.meta.locale !== locale) {
				throw new Error(
					`content/blog/${locale}/${fileName}: front matter locale "${post.meta.locale}" does not match folder`,
				);
			}
			if (`${post.meta.slug}.md` !== fileName) {
				throw new Error(
					`content/blog/${locale}/${fileName}: front matter slug "${post.meta.slug}" does not match file name`,
				);
			}
			posts.push({
				post,
				locale,
				publicPath: `/content/blog/${locale}/${fileName}`,
				fileName,
			});
		}
	}
	return posts;
}

/** Published (non-draft) posts as manifest entries, newest first. */
export function toManifestEntries(posts: LoadedPost[]): BlogManifestEntry[] {
	return posts
		.filter(({ post }) => !post.meta.draft)
		.map(({ post, publicPath }) => ({
			title: post.meta.title,
			description: post.meta.description,
			publishedAt: post.meta.publishedAt,
			...(post.meta.updatedAt !== undefined
				? { updatedAt: post.meta.updatedAt }
				: {}),
			slug: post.meta.slug,
			locale: post.meta.locale,
			translationKey: post.meta.translationKey,
			tags: post.meta.tags,
			featured: post.meta.featured,
			...(post.meta.coverImage !== undefined
				? { coverImage: post.meta.coverImage }
				: {}),
			...(post.meta.coverImageAlt !== undefined
				? { coverImageAlt: post.meta.coverImageAlt }
				: {}),
			path: publicPath,
			readingMinutes: estimateReadingMinutes(post.markdown),
		}))
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
