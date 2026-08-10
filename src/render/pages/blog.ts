import { blogPostPath, pagePath } from '@/app/configuration';
import type { BlogManifestEntry } from '@/domain/models/blog';
import type { BlogPost } from '@/domain/models/blog';
import {
	blogJsonLd,
	blogPostingJsonLd,
	breadcrumbJsonLd,
	webPageJsonLd,
} from '@/domain/services/seo';
import { feedPath } from '@/domain/services/feed';
import type { RenderedMarkdown } from '@/domain/services/markdown';
import { estimateReadingMinutes } from '@/domain/services/reading-time';
import { formatMessage } from '@/features/i18n';
import type { RenderContext } from '@/render/layout';
import { blogCard, breadcrumbs, postDates, techTags } from '@/render/ui';
import { html, raw, type SafeHtml } from '@/utils/html';
import type { RenderedPage } from './types';

/** Decorative feed glyph; the link text carries the meaning. */
const FEED_ICON =
	'<svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg>';

/**
 * Blog index. The static list contains all build-time posts; the
 * jp-blog-list island re-renders the same layout from the runtime
 * manifest so posts uploaded after deployment appear too.
 */
export function renderBlogIndexPage(
	ctx: RenderContext,
	posts: readonly BlogManifestEntry[],
): RenderedPage {
	const { messages, locale } = ctx;
	const meta = {
		locale,
		path: ctx.path,
		title: messages.blog.title,
		description: messages.blog.description,
	};
	const trail = [
		{ name: messages.nav.home, path: pagePath(locale, 'home') },
		{ name: messages.nav.blog, path: ctx.path },
	];
	const main = html`
		<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
			${breadcrumbs(trail, messages)}
			<h1 class="text-4xl font-semibold tracking-tight">
				${messages.blog.heading}
			</h1>
			<p class="text-ink-muted dark:text-snow-muted mt-4 max-w-2xl text-lg">
				${messages.blog.intro}
			</p>
			<p class="mt-4">
				<a
					href="${feedPath(locale)}"
					class="text-accent dark:text-accent-dark inline-flex min-h-9 items-center gap-2 text-sm font-medium underline underline-offset-2 hover:no-underline"
					>${raw(FEED_ICON)}${messages.blog.feedLink}</a
				>
			</p>
			<jp-blog-list locale="${locale}">
				<div data-blog-status aria-live="polite" class="sr-only"></div>
				<p
					class="text-ink-muted dark:text-snow-muted mt-8 text-sm"
					data-post-count
				>
					${formatMessage(messages.blog.postCount, { count: posts.length })}
				</p>
				<div
					class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
					data-post-grid
				>
					${
						posts.length > 0
							? posts.map((post) =>
									blogCard(post, locale, messages, { headingLevel: 'h2' }),
								)
							: null
					}
				</div>
				${
					posts.length === 0
						? html`<p
								class="text-ink-muted dark:text-snow-muted mt-6"
								data-empty-state
							>
								${messages.blog.empty}
							</p>`
						: null
				}
			</jp-blog-list>
		</div>
	`;
	return {
		meta: {
			...meta,
			jsonLd: [
				webPageJsonLd(meta),
				blogJsonLd(locale, ctx.path),
				breadcrumbJsonLd(trail),
			],
		},
		main,
		options: { extraScripts: ['article'] },
	};
}

/**
 * Table of contents for long articles (rendered when ≥ 3 headings).
 * `data-toc` marks it for the jp-article-tools island, which highlights
 * the section currently in view.
 */
export function articleToc(
	rendered: RenderedMarkdown,
	messages: RenderContext['messages'],
): SafeHtml | null {
	if (rendered.toc.length < 3) {
		return null;
	}
	return html`<nav
		aria-labelledby="toc-heading"
		data-toc
		class="jp-toc rounded-card border-line dark:border-night-line bg-paper-raised/60 dark:bg-night-raised/50 mt-8 border p-5"
	>
		<h2
			id="toc-heading"
			class="text-ink-muted dark:text-snow-muted text-xs font-semibold tracking-widest uppercase"
		>
			${messages.blog.tocHeading}
		</h2>
		<ol class="text-ink-muted dark:text-snow-muted mt-3 space-y-1 text-sm">
			${rendered.toc.map(
				(entry) =>
					html`<li>
						<a
							href="#${entry.id}"
							class="${`jp-toc-link hover:text-accent dark:hover:text-accent-dark block rounded py-1 underline-offset-2 hover:underline${entry.level === 3 ? ' jp-toc-link--sub' : ''}`}"
							>${entry.text}</a
						>
					</li>`,
			)}
		</ol>
	</nav>`;
}

/** Shared article body markup (used by prerender and the client island). */
export function articleBody(
	ctx: RenderContext,
	post: {
		title: string;
		publishedAt: string;
		updatedAt?: string | undefined;
		tags: readonly string[];
		readingMinutes?: number | undefined;
	},
	rendered: RenderedMarkdown,
	translations: readonly BlogManifestEntry[],
): SafeHtml {
	const { messages, locale } = ctx;
	return html`
		<header class="space-y-4">
			${breadcrumbs(
				[
					{ name: messages.nav.home, path: pagePath(locale, 'home') },
					{ name: messages.nav.blog, path: pagePath(locale, 'blog') },
					{ name: post.title, path: ctx.path },
				],
				messages,
			)}
			<h1 class="text-4xl font-semibold tracking-tight text-balance">
				${post.title}
			</h1>
			${postDates(post, locale, messages)}
			${
				post.tags.length > 0
					? techTags(post.tags, messages.blog.tagsLabel)
					: null
			}
			${
				translations.length > 0
					? html`<p class="text-ink-muted dark:text-snow-muted text-sm">
							${messages.blog.availableIn}${translations.map(
								(translation, index) =>
									html`${index > 0 ? ', ' : ''}<a
											href="${blogPostPath(translation.locale, translation.slug)}"
											hreflang="${translation.locale}"
											lang="${translation.locale}"
											class="text-accent dark:text-accent-dark underline underline-offset-2 hover:no-underline"
											>${messages.language[translation.locale]}</a
										>`,
							)}
						</p>`
					: null
			}
		</header>
		${articleToc(rendered, messages)}
		<div class="jp-prose mt-10" data-article-body>${raw(rendered.html)}</div>
		<footer class="border-line dark:border-night-line mt-14 border-t pt-6">
			<a
				href="${pagePath(locale, 'blog')}"
				class="text-accent dark:text-accent-dark inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-2 hover:no-underline"
				>← ${messages.blog.backToBlog}</a
			>
		</footer>
	`;
}

/** Fully pre-rendered article page for posts known at build time. */
export function renderBlogArticlePage(
	ctx: RenderContext,
	post: BlogPost,
	rendered: RenderedMarkdown,
	translations: readonly BlogManifestEntry[],
): RenderedPage {
	const { messages, locale } = ctx;
	const path = blogPostPath(locale, post.meta.slug);
	const readingMinutes = estimateReadingMinutes(post.markdown);
	const jsonLdPost = {
		title: post.meta.title,
		description: post.meta.description,
		path,
		locale,
		publishedAt: post.meta.publishedAt,
		tags: post.meta.tags,
		...(post.meta.updatedAt !== undefined
			? { updatedAt: post.meta.updatedAt }
			: {}),
		...(post.meta.coverImage !== undefined
			? { coverImage: post.meta.coverImage }
			: {}),
	};
	return {
		meta: {
			locale,
			path,
			title: `${post.meta.title} — ${messages.siteName}`,
			description: post.meta.description,
			ogType: 'article',
			...(post.meta.canonicalUrl !== undefined
				? { canonicalUrl: post.meta.canonicalUrl }
				: {}),
			...(post.meta.coverImage !== undefined
				? { ogImage: post.meta.coverImage }
				: {}),
			jsonLd: [
				blogPostingJsonLd(jsonLdPost),
				breadcrumbJsonLd([
					{ name: messages.nav.home, path: pagePath(locale, 'home') },
					{ name: messages.nav.blog, path: pagePath(locale, 'blog') },
					{ name: post.meta.title, path },
				]),
			],
		},
		main: html`<jp-article-tools
			data-copy="${messages.blog.copyCode}"
			data-copied="${messages.blog.copiedCode}"
			data-copy-failed="${messages.blog.copyCodeFailed}"
			data-heading-link="${messages.blog.headingLink}"
			data-progress="${messages.blog.readingProgress}"
			class="block"
		>
			<article class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
				${articleBody(
					ctx,
					{ ...post.meta, readingMinutes },
					rendered,
					translations,
				)}
			</article>
		</jp-article-tools>`,
		// Only the reading affordances — a prerendered article needs
		// neither the manifest client nor bQuery's component runtime.
		options: { extraScripts: ['article-tools'] },
	};
}

/**
 * Client-side article shell for posts uploaded after deployment. The
 * static host rewrites unknown `/{locale}/blog/{slug}/` URLs to this
 * page; the jp-blog-article island loads the manifest and Markdown.
 * Marked noindex — search engines index prerendered pages instead.
 */
export function renderBlogArticleShellPage(ctx: RenderContext): RenderedPage {
	const { messages, locale } = ctx;
	return {
		meta: {
			locale,
			path: ctx.path,
			title: messages.blog.title,
			description: messages.blog.description,
			noindex: true,
		},
		main: html`<jp-article-tools
			data-copy="${messages.blog.copyCode}"
			data-copied="${messages.blog.copiedCode}"
			data-copy-failed="${messages.blog.copyCodeFailed}"
			data-heading-link="${messages.blog.headingLink}"
			data-progress="${messages.blog.readingProgress}"
			class="mx-auto block max-w-3xl px-4 py-16 sm:px-6"
		>
			<jp-blog-article
				locale="${locale}"
				data-loading="${messages.blog.loading}"
				data-error="${messages.blog.loadError}"
				data-not-found="${messages.blog.notFound}"
				data-back="${messages.blog.backToBlog}"
				data-back-href="${pagePath(locale, 'blog')}"
			>
				<h1 class="text-4xl font-semibold tracking-tight">
					${messages.blog.heading}
				</h1>
				<p class="text-ink-muted dark:text-snow-muted mt-6" aria-live="polite">
					${messages.blog.loading}
				</p>
			</jp-blog-article>
		</jp-article-tools>`,
		options: { extraScripts: ['article'] },
	};
}
