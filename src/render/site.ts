import { blogPostPath, pagePath } from '@/app/configuration';
import type { BlogManifestEntry, BlogPost } from '@/domain/models/blog';
import { LOCALES, type Locale } from '@/domain/models/locale';
import { ACCESSIBILITY, IMPRINT, PRIVACY } from '@/content/pages/legal';
import type { RenderedMarkdown } from '@/domain/services/markdown';
import {
	createRenderContext,
	renderDocument,
	type AssetResolver,
} from '@/render/layout';
import { renderAboutPage } from '@/render/pages/about';
import {
	renderBlogArticlePage,
	renderBlogArticleShellPage,
	renderBlogIndexPage,
} from '@/render/pages/blog';
import { renderContactPage } from '@/render/pages/contact';
import { renderHomePage } from '@/render/pages/home';
import { renderLegalPage } from '@/render/pages/legal';
import { renderNotFoundPage } from '@/render/pages/not-found';
import { renderProjectsPage } from '@/render/pages/projects';
import { renderRootPage } from '@/render/pages/root';

/** Build-time blog data injected into the route map. */
export interface SiteBlogData {
	/** Published manifest entries (all locales), newest first. */
	readonly entries: readonly BlogManifestEntry[];
	/** Parsed + rendered posts keyed by `${locale}:${slug}`. */
	readonly articles: ReadonlyMap<
		string,
		{ post: BlogPost; rendered: RenderedMarkdown }
	>;
}

export type RouteRenderer = () => string;

function entriesFor(data: SiteBlogData, locale: Locale): BlogManifestEntry[] {
	return data.entries.filter((entry) => entry.locale === locale);
}

/**
 * The complete route map of the site: path → document renderer. Used by
 * the prerender script (all routes) and the dev server (per request).
 */
export function buildRoutes(
	assets: AssetResolver,
	blog: SiteBlogData,
): Map<string, RouteRenderer> {
	const routes = new Map<string, RouteRenderer>();

	const add = (
		path: string,
		render: (ctx: ReturnType<typeof createRenderContext>) => {
			meta: Parameters<typeof renderDocument>[1];
			main: Parameters<typeof renderDocument>[2];
			options?: Parameters<typeof renderDocument>[3];
		},
		locale: Locale,
	): void => {
		routes.set(path, () => {
			const ctx = createRenderContext(locale, path, assets);
			const page = render(ctx);
			return renderDocument(ctx, page.meta, page.main, page.options);
		});
	};

	add('/', (ctx) => renderRootPage(ctx), 'de');

	for (const locale of LOCALES) {
		const posts = entriesFor(blog, locale);
		add(pagePath(locale, 'home'), (ctx) => renderHomePage(ctx, posts), locale);
		add(pagePath(locale, 'about'), (ctx) => renderAboutPage(ctx), locale);
		add(pagePath(locale, 'projects'), (ctx) => renderProjectsPage(ctx), locale);
		add(
			pagePath(locale, 'blog'),
			(ctx) => renderBlogIndexPage(ctx, posts),
			locale,
		);
		add(pagePath(locale, 'contact'), (ctx) => renderContactPage(ctx), locale);
		add(
			pagePath(locale, 'imprint'),
			(ctx) => renderLegalPage(ctx, 'imprint', IMPRINT),
			locale,
		);
		add(
			pagePath(locale, 'privacy'),
			(ctx) => renderLegalPage(ctx, 'privacy', PRIVACY),
			locale,
		);
		add(
			pagePath(locale, 'accessibility'),
			(ctx) => renderLegalPage(ctx, 'accessibility', ACCESSIBILITY),
			locale,
		);
		add(`/${locale}/404.html`, (ctx) => renderNotFoundPage(ctx), locale);
		// Client-side shell for posts uploaded after the build (host
		// rewrites unknown blog slugs here; see docs/deployment.md).
		add(
			`/${locale}/blog/_article/`,
			(ctx) => renderBlogArticleShellPage(ctx),
			locale,
		);

		for (const [index, entry] of posts.entries()) {
			const key = `${locale}:${entry.slug}`;
			const article = blog.articles.get(key);
			if (article === undefined) {
				continue;
			}
			const translations = blog.entries.filter(
				(candidate) =>
					candidate.translationKey === entry.translationKey &&
					candidate.locale !== locale,
			);
			// `posts` is newest first, so the lower index is the newer post.
			const neighbours = {
				...(posts[index - 1] !== undefined ? { newer: posts[index - 1] } : {}),
				...(posts[index + 1] !== undefined ? { older: posts[index + 1] } : {}),
			};
			add(
				blogPostPath(locale, entry.slug),
				(ctx) =>
					renderBlogArticlePage(
						ctx,
						article.post,
						article.rendered,
						translations,
						neighbours,
					),
				locale,
			);
		}
	}
	return routes;
}
