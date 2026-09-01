import { component } from '@bquery/bquery/component';
import { announceToScreenReader } from '@bquery/bquery/a11y';
import type { BlogManifestEntry } from '@/domain/models/blog';
import { isLocale, type Locale } from '@/domain/models/locale';
import {
	BlogManifestService,
	type FetchLike,
} from '@/domain/services/blog-manifest-service';
import type { RenderedMarkdown } from '@/domain/services/markdown';
import { messagesFor } from '@/features/i18n';
import { createRenderContext, type AssetResolver } from '@/render/layout';
import { articleBody } from '@/render/pages/blog';

/**
 * jp-blog-article — client-side renderer for blog posts that were
 * uploaded to the server after the site was built. The static host
 * rewrites unknown `/{locale}/blog/{slug}/` routes to the shell page
 * containing this island; it resolves the slug from the URL, loads the
 * manifest and the Markdown file, and renders the sanitized article.
 */

type ArticleStatus = 'loading' | 'ready' | 'not-found' | 'error';

interface ArticleState extends Record<string, unknown> {
	status: ArticleStatus;
	html: string;
}

/** Asset URLs are irrelevant for client-side re-rendering. */
const NO_ASSETS: AssetResolver = {
	script: () => '',
	styles: () => [],
	extraHead: () => '',
};

function slugFromLocation(pathname: string, locale: Locale): string | null {
	const match = new RegExp(`^/${locale}/blog/([a-z0-9-]+)/?`).exec(pathname);
	return match?.[1] ?? null;
}

async function loadArticle(
	locale: Locale,
	slug: string,
	fetchFn: FetchLike,
): Promise<{
	html: string;
	entry: BlogManifestEntry;
	title: string;
	description: string;
} | null> {
	const manifest = await new BlogManifestService(fetchFn).load();
	const entry = BlogManifestService.findPost(manifest, locale, slug);
	if (entry === undefined) {
		return null;
	}
	// The Markdown pipeline (marked + highlight.js) dominates this entry's
	// bundle but is only needed on this rare path — a post uploaded after
	// the build. Loading it on demand keeps the eager blog chunk small.
	const [{ MarkdownArticleService }, { renderMarkdown }, { highlightCode }] =
		await Promise.all([
			import('@/domain/services/markdown-article-service'),
			import('@/domain/services/markdown'),
			import('@/features/blog/highlight'),
		]);
	const post = await new MarkdownArticleService(fetchFn).load(entry.path);
	if (post.meta.draft) {
		return null;
	}
	const messages = messagesFor(locale);
	const rendered: RenderedMarkdown = renderMarkdown(post.markdown, {
		externalLinkLabel: messages.externalLink,
		highlight: highlightCode,
	});
	const ctx = createRenderContext(
		locale,
		`/${locale}/blog/${slug}/`,
		NO_ASSETS,
	);
	const translations = BlogManifestService.translationsOf(manifest, entry);
	return {
		html: articleBody(ctx, post.meta, rendered, translations).value,
		entry,
		title: post.meta.title,
		description: post.meta.description,
	};
}

export function registerBlogArticle(fetchFn: FetchLike = fetch): void {
	component<{ locale: string }, ArticleState>('jp-blog-article', {
		shadow: false,
		props: { locale: { type: String, required: true } },
		state: { status: 'loading', html: '' },
		// The article HTML is pre-sanitized by renderMarkdown; the component
		// sanitizer runs again as defense in depth and must not strip the
		// attributes the article markup relies on.
		sanitize: {
			allowAttributes: ['checked', 'disabled', 'datetime', 'tabindex'],
		},
		connected() {
			const localeAttr = this.getProp<string>('locale');
			if (!isLocale(localeAttr)) {
				return;
			}
			const messages = messagesFor(localeAttr);
			const slug = slugFromLocation(location.pathname, localeAttr);
			if (slug === null) {
				this.setState('status', 'not-found');
				return;
			}
			loadArticle(localeAttr, slug, fetchFn)
				.then((article) => {
					if (article === null) {
						this.setState('status', 'not-found');
						announceToScreenReader(messages.blog.notFound, 'assertive');
						return;
					}
					document.title = `${article.title} — ${messages.siteName}`;
					document
						.querySelector('meta[name="description"]')
						?.setAttribute('content', article.description);
					this.setState('html', article.html);
					this.setState('status', 'ready');
					announceToScreenReader(article.title);
				})
				.catch(() => {
					this.setState('status', 'error');
					announceToScreenReader(messages.blog.loadError, 'assertive');
				});
		},
		render({ props, state }) {
			const localeAttr = props.locale;
			const host = document.querySelector('jp-blog-article');
			const label = (name: string, fallback: string): string =>
				host?.getAttribute(`data-${name}`) ?? fallback;
			const backLink = `<p class="mt-8"><a href="${label('back-href', `/${localeAttr}/blog/`)}" class="jp-link jp-meta">← ${label('back', 'Blog')}</a></p>`;
			switch (state.status) {
				case 'loading':
					// Empty first render keeps the server-rendered fallback
					// (heading + loading message) in place.
					return '';
				case 'not-found':
					return `<div role="alert"><h1 class="jp-display text-4xl">404</h1><p class="text-ink-muted dark:text-snow-muted mt-6">${label('not-found', 'Not found')}</p>${backLink}</div>`;
				case 'error':
					return `<div role="alert"><h1 class="jp-display text-4xl">${label('back', 'Blog')}</h1><p class="text-ink-muted dark:text-snow-muted mt-6">${label('error', 'Error')}</p>${backLink}</div>`;
				case 'ready':
					return `<article>${state.html}</article>`;
			}
		},
	});
}
