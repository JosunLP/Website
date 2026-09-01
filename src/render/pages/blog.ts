import { blogPostPath, pagePath } from '@/app/configuration';
import type { BlogManifestEntry } from '@/domain/models/blog';
import type { BlogPost } from '@/domain/models/blog';
import {
	absoluteUrl,
	blogPostingJsonLd,
	pageGraphJsonLd,
	pageTitle,
	ENTITY_ID,
} from '@/domain/services/seo';
import { feedPath } from '@/domain/services/feed';
import type { RenderedMarkdown } from '@/domain/services/markdown';
import {
	estimateReadingMinutes,
	estimateWordCount,
} from '@/domain/services/reading-time';
import { formatMessage } from '@/features/i18n';
import type { RenderContext } from '@/render/layout';
import {
	blogCard,
	breadcrumbs,
	postDates,
	ROW_LIST,
	techTags,
} from '@/render/ui';
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
		<div class="mx-auto max-w-5xl px-4 py-16 sm:px-6">
			${breadcrumbs(trail, messages)}
			<h1 class="jp-display max-w-2xl text-4xl sm:text-6xl">
				${messages.blog.heading}
			</h1>
			<p
				class="text-ink-muted dark:text-snow-muted mt-8 max-w-[52ch] text-lg leading-relaxed"
			>
				${messages.blog.intro}
			</p>
			<p class="mt-8">
				<a
					href="${feedPath(locale)}"
					class="jp-link jp-meta inline-flex min-h-9 items-center gap-2"
					>${raw(FEED_ICON)}${messages.blog.feedLink}</a
				>
			</p>
			<jp-blog-list
				locale="${locale}"
				data-reading-time="${messages.blog.readingTime}"
				data-tags-label="${messages.blog.tagsLabel}"
				data-count-label="${messages.blog.postCount}"
				data-error-label="${messages.blog.loadError}"
			>
				<div data-blog-status aria-live="polite" class="sr-only"></div>
				<jp-tag-filter
					class="block"
					data-label="${messages.blog.filterLabel}"
					data-all="${messages.blog.filterAll}"
					data-result="${messages.blog.filterResult}"
				></jp-tag-filter>
				<p
					class="jp-label text-ink-muted dark:text-snow-muted mt-6"
					data-post-count
				>
					${formatMessage(messages.blog.postCount, { count: posts.length })}
				</p>
				<div class="${ROW_LIST} mt-4" data-post-grid>
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
	// Every listed post gets its own node so the index describes the
	// collection rather than just declaring that a blog exists.
	const postNodes = posts.map((post) =>
		blogPostingJsonLd({
			title: post.title,
			description: post.description,
			path: blogPostPath(post.locale, post.slug),
			locale: post.locale,
			publishedAt: post.publishedAt,
			...(post.updatedAt !== undefined ? { updatedAt: post.updatedAt } : {}),
			tags: post.tags,
			...(post.coverImage !== undefined ? { coverImage: post.coverImage } : {}),
			...(post.readingMinutes !== undefined
				? { readingMinutes: post.readingMinutes }
				: {}),
		}),
	);
	const blogNode = {
		'@type': 'Blog',
		'@id': `${absoluteUrl(ctx.path)}#blog`,
		name: messages.blog.heading,
		description: messages.blog.description,
		url: absoluteUrl(ctx.path),
		inLanguage: locale,
		author: { '@id': ENTITY_ID.person },
		publisher: { '@id': ENTITY_ID.person },
		blogPost: postNodes.map((node) => ({
			'@id': (node as { '@id': string })['@id'],
		})),
	};
	return {
		meta: {
			...meta,
			jsonLd: [
				pageGraphJsonLd({
					meta,
					pageType: 'CollectionPage',
					breadcrumb: trail,
					mainEntity: blogNode['@id'],
					nodes: [blogNode, ...postNodes],
				}),
			],
		},
		main,
		options: { extraScripts: ['blog-index'] },
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
		class="jp-toc border-line dark:border-night-line mt-12 border-t pt-6"
	>
		<h2 id="toc-heading" class="jp-label text-ink-muted dark:text-snow-muted">
			${messages.blog.tocHeading}
		</h2>
		<ol class="jp-meta text-ink-muted dark:text-snow-muted mt-4 space-y-1">
			${rendered.toc.map(
				(entry) =>
					html`<li>
						<a
							href="#${entry.id}"
							class="${`jp-toc-link hover:text-ink dark:hover:text-snow block py-1${entry.level === 3 ? ' jp-toc-link--sub' : ''}`}"
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
		<header>
			${breadcrumbs(
				[
					{ name: messages.nav.home, path: pagePath(locale, 'home') },
					{ name: messages.nav.blog, path: pagePath(locale, 'blog') },
					{ name: post.title, path: ctx.path },
				],
				messages,
			)}
			<h1 class="jp-display text-4xl sm:text-5xl">${post.title}</h1>
			<div class="mt-6">${postDates(post, locale, messages)}</div>
			${
				post.tags.length > 0
					? techTags(post.tags, messages.blog.tagsLabel)
					: null
			}
			${
				translations.length > 0
					? html`<p class="jp-meta text-ink-muted dark:text-snow-muted mt-4">
							${messages.blog.availableIn}${translations.map(
								(translation, index) =>
									html`${index > 0 ? ', ' : ''}<a
											href="${blogPostPath(translation.locale, translation.slug)}"
											hreflang="${translation.locale}"
											lang="${translation.locale}"
											class="jp-link"
											>${messages.language[translation.locale]}</a
										>`,
							)}
						</p>`
					: null
			}
		</header>
		${articleToc(rendered, messages)}
		<div class="jp-prose mt-14" data-article-body>${raw(rendered.html)}</div>
		<footer class="border-line dark:border-night-line mt-16 border-t pt-6">
			<a
				href="${pagePath(locale, 'blog')}"
				class="jp-link jp-meta inline-flex min-h-11 items-center gap-2"
				><span aria-hidden="true">←</span>${messages.blog.backToBlog}</a
			>
		</footer>
	`;
}

/** Neighbouring posts in the same locale, newest first. */
export interface ArticleNeighbours {
	readonly newer?: BlogManifestEntry;
	readonly older?: BlogManifestEntry;
}

/**
 * Links to the adjacent posts. Purely additive for readers, and it gives
 * every article at least two inbound links from other articles instead of
 * leaving each one reachable only through the index.
 */
function articleNeighbourNav(
	ctx: RenderContext,
	neighbours: ArticleNeighbours,
): SafeHtml | null {
	const { messages, locale } = ctx;
	const entries = [
		{ entry: neighbours.newer, label: messages.blog.newerPost },
		{ entry: neighbours.older, label: messages.blog.olderPost },
	].filter(
		(candidate): candidate is { entry: BlogManifestEntry; label: string } =>
			candidate.entry !== undefined,
	);
	if (entries.length === 0) {
		return null;
	}
	return html`<nav
		aria-labelledby="more-reading"
		class="border-line dark:border-night-line mt-16 border-t pt-8"
	>
		<h2 id="more-reading" class="jp-label text-ink-muted dark:text-snow-muted">
			${messages.blog.moreReading}
		</h2>
		<ul class="mt-6 grid sm:grid-cols-2 sm:gap-x-10">
			${entries.map(
				({ entry, label }) =>
					html`<li class="border-line dark:border-night-line border-t">
						<a
							href="${blogPostPath(locale, entry.slug)}"
							class="group flex h-full flex-col gap-2 py-5 no-underline"
						>
							<span class="jp-label text-ink-muted dark:text-snow-muted"
								>${label}</span
							>
							<span
								class="text-ink dark:text-snow font-medium underline-offset-4 group-hover:underline"
								>${entry.title}</span
							>
						</a>
					</li>`,
			)}
		</ul>
	</nav>`;
}

/** Fully pre-rendered article page for posts known at build time. */
export function renderBlogArticlePage(
	ctx: RenderContext,
	post: BlogPost,
	rendered: RenderedMarkdown,
	translations: readonly BlogManifestEntry[],
	neighbours: ArticleNeighbours = {},
): RenderedPage {
	const { messages, locale } = ctx;
	const path = blogPostPath(locale, post.meta.slug);
	const readingMinutes = estimateReadingMinutes(post.markdown);
	const meta = {
		locale,
		path,
		title: pageTitle(post.meta.title, messages.siteName),
		description: post.meta.description,
		ogType: 'article' as const,
		article: {
			publishedAt: post.meta.publishedAt,
			...(post.meta.updatedAt !== undefined
				? { updatedAt: post.meta.updatedAt }
				: {}),
			tags: post.meta.tags,
			...(post.meta.tags[0] !== undefined
				? { section: post.meta.tags[0] }
				: {}),
		},
		...(post.meta.canonicalUrl !== undefined
			? { canonicalUrl: post.meta.canonicalUrl }
			: {}),
		...(post.meta.coverImage !== undefined
			? { ogImage: post.meta.coverImage }
			: {}),
	};
	const article = blogPostingJsonLd({
		title: post.meta.title,
		description: post.meta.description,
		path,
		locale,
		publishedAt: post.meta.publishedAt,
		tags: post.meta.tags,
		wordCount: estimateWordCount(post.markdown),
		readingMinutes,
		...(post.meta.updatedAt !== undefined
			? { updatedAt: post.meta.updatedAt }
			: {}),
		...(post.meta.coverImage !== undefined
			? { coverImage: post.meta.coverImage }
			: {}),
	});
	return {
		meta: {
			...meta,
			jsonLd: [
				pageGraphJsonLd({
					meta,
					mainEntity: (article as { '@id': string })['@id'],
					breadcrumb: [
						{ name: messages.nav.home, path: pagePath(locale, 'home') },
						{ name: messages.nav.blog, path: pagePath(locale, 'blog') },
						{ name: post.meta.title, path },
					],
					nodes: [article],
				}),
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
			<article class="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
				${articleBody(
					ctx,
					{ ...post.meta, readingMinutes },
					rendered,
					translations,
				)}
			</article>
			<div class="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
				${articleNeighbourNav(ctx, neighbours)}
			</div>
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
			// Distinct from the blog index on purpose: the shell is a
			// different route and must not present itself as a copy of it.
			title: messages.blog.shellTitle,
			description: messages.blog.shellDescription,
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
				<h1 class="jp-display text-4xl sm:text-5xl">
					${messages.blog.heading}
				</h1>
				<p
					class="jp-meta text-ink-muted dark:text-snow-muted mt-6"
					aria-live="polite"
				>
					${messages.blog.loading}
				</p>
			</jp-blog-article>
		</jp-article-tools>`,
		options: { extraScripts: ['article'] },
	};
}
