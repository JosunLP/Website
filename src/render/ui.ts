import type { BlogManifestEntry } from '@/domain/models/blog';
import type { Locale } from '@/domain/models/locale';
import type { Project } from '@/domain/models/project';
import { blogPostPath } from '@/app/configuration';
import { formatIsoDate, formatMessage } from '@/features/i18n';
import type { AppMessages } from '@/features/i18n/messages';
import * as css from '@/render/classes';
import { html, raw, type SafeHtml } from '@/utils/html';

/**
 * Reusable presentational partials. Pure functions: typed data in,
 * escaped HTML out. Interactive behavior lives in the `jp-*` Web
 * Components that enhance this markup client-side.
 *
 * The visual system is deliberately narrow. Content sits in ruled rows
 * instead of cards, structural information (indices, dates, licences,
 * technologies) speaks in the monospace voice, and the accent appears
 * only where it means something. Anything that would be decoration
 * belongs in neither this file nor the pages.
 */

export { ROW_LIST } from '@/render/classes';

/** Inline metadata separator; decorative, so it stays out of the a11y tree. */
const SEPARATOR = raw(
	`<span aria-hidden="true" class="${css.SEPARATOR}">·</span>`,
);

/** Trailing arrow for "go here" links; steps forward on hover via CSS. */
const ARROW = raw('<span class="jp-arrow" aria-hidden="true">→</span>');

/**
 * Serialises tags into a `data-tags` attribute the client filter can
 * match against. Both ends are padded with the delimiter so a substring
 * test never matches a partial tag ("Vite" inside "Vitest").
 */
export function tagAttribute(tags: readonly string[]): string {
	return tags.length === 0 ? '' : `|${tags.join('|')}|`;
}

/** Two-digit ordinal used to index rows and sections. Decorative. */
function ordinal(index: number): string {
	return String(index + 1).padStart(2, '0');
}

/** External links: new tab + safe rel + visually hidden hint. */
export function externalLink(
	href: string,
	label: string,
	messages: AppMessages,
	classes = 'jp-link',
): SafeHtml {
	return html`<a
		href="${href}"
		target="_blank"
		rel="noopener noreferrer"
		class="${classes}"
		>${label}<span class="sr-only"> (${messages.externalLink})</span></a
	>`;
}

export type ButtonVariant = 'primary' | 'secondary';

export function buttonLink(
	href: string,
	label: string,
	variant: ButtonVariant = 'primary',
): SafeHtml {
	return html`<a href="${href}" class="${`jp-btn jp-btn--${variant}`}"
		>${label}</a
	>`;
}

/** One step of a breadcrumb trail: a label and the page it points at. */
export interface BreadcrumbItem {
	readonly name: string;
	readonly path: string;
}

/**
 * Visible breadcrumb trail. Takes the same item list that feeds
 * {@link import('@/domain/services/seo').breadcrumbJsonLd}, so the
 * structured data and what the page actually shows cannot drift apart.
 *
 * The current page is rendered as plain text rather than a self-link:
 * a link that goes nowhere is a known screen-reader annoyance.
 */
export function breadcrumbs(
	items: readonly BreadcrumbItem[],
	messages: AppMessages,
): SafeHtml {
	return html`<nav aria-label="${messages.breadcrumbLabel}" class="mb-10">
		<ol
			class="jp-meta text-ink-muted dark:text-snow-muted flex flex-wrap items-center gap-x-2"
		>
			${items.map((item, index) => {
				const isLast = index === items.length - 1;
				return html`<li class="flex items-center gap-x-2">
					${
						index > 0
							? raw(
									'<span aria-hidden="true" class="text-line-strong dark:text-night-line-strong">/</span>',
								)
							: null
					}${
						isLast
							? // Truncated: article titles are long, and the <h1>
								// directly below repeats them in full. The complete
								// text stays in the DOM for assistive technology.
								html`<span
									aria-current="page"
									class="text-ink dark:text-snow max-w-[min(100%,42ch)] truncate"
									>${item.name}</span
								>`
							: html`<a href="${item.path}" class="jp-link-quiet"
									>${item.name}</a
								>`
					}
				</li>`;
			})}
		</ol>
	</nav>`;
}

/**
 * Section opener: a hairline, a numbered monospace kicker, the heading,
 * and an optional standfirst. Sections carry their own index so the page
 * reads as a numbered document instead of a stack of unrelated blocks —
 * and so no page has to invent its own spacing for the same three parts.
 */
export function sectionHeading(
	index: number,
	id: string,
	kicker: string,
	title: string,
	intro?: string,
): SafeHtml {
	return html`<header
		class="border-line dark:border-night-line mb-12 border-t pt-6"
	>
		<p
			class="jp-label text-ink-muted dark:text-snow-muted flex items-baseline gap-2.5"
			aria-hidden="true"
		>
			<span>${ordinal(index)}</span>
			<span class="text-line-strong dark:text-night-line-strong">/</span>
			<span>${kicker}</span>
		</p>
		<h2 id="${id}" class="jp-title mt-5 text-3xl sm:text-4xl">${title}</h2>
		${
			intro !== undefined
				? html`<p
						class="text-ink-muted dark:text-snow-muted mt-5 max-w-2xl leading-relaxed"
					>
						${intro}
					</p>`
				: null
		}
	</header>`;
}

/**
 * Technology / tag list. A real list for assistive technology, set in the
 * monospace voice and separated by middots — every keyword used to be a
 * bordered pill, which turned three words of metadata into the loudest
 * element in the row.
 */
export function techTags(
	technologies: readonly string[],
	label: string,
): SafeHtml {
	return html`<ul class="${css.TAGLIST}" aria-label="${label}">
		${technologies.map((tech) => html`<li>${tech}</li>`)}
	</ul>`;
}

/** Status marker; conveys state through text, not color alone. */
export function statusBadge(
	status: Project['status'],
	messages: AppMessages,
): SafeHtml {
	const label = messages.projects.status[status];
	return html`<span
		class="jp-label text-ink-muted dark:text-snow-muted inline-flex items-center gap-2"
		>${
			status === 'active'
				? raw(
						'<span class="bg-accent dark:bg-accent-dark h-1.5 w-1.5" aria-hidden="true"></span>',
					)
				: raw(
						'<span class="bg-line-strong dark:bg-night-line-strong h-1.5 w-1.5" aria-hidden="true"></span>',
					)
		}${label}</span
	>`;
}

/**
 * Project row. Fully keyboard accessible; no hover-only content — the
 * pointer highlight is an affordance, never the only way to read
 * something.
 */
export function projectCard(
	project: Project,
	locale: Locale,
	messages: AppMessages,
	options: { headingLevel?: 'h3' | 'h2'; index?: number } = {},
): SafeHtml {
	const heading = options.headingLevel ?? 'h3';
	const index = options.index ?? 0;
	return html`<article class="${css.ROW}">
		<div class="${css.ROW_GRID}">
			<div class="md:col-span-4">
				<p
					class="jp-label text-ink-muted dark:text-snow-muted"
					aria-hidden="true"
				>
					${ordinal(index)}
				</p>
				<${raw(heading)} class="jp-title mt-3 text-2xl">
					${externalLink(
						project.repositoryUrl,
						project.name,
						messages,
						'jp-row-link text-ink dark:text-snow',
					)}
				</${raw(heading)}>
				<p class="mt-4">${statusBadge(project.status, messages)}</p>
			</div>
			<div class="md:col-span-7 md:col-start-6">
				<p class="text-ink-muted dark:text-snow-muted leading-relaxed">
					${project.description[locale]}
				</p>
				${techTags(project.technologies, messages.projects.technologiesLabel)}
				<dl
					class="jp-meta text-ink-muted dark:text-snow-muted mt-4 flex flex-wrap gap-x-6 gap-y-1"
				>
					<div class="flex gap-1.5">
						<dt>${messages.projects.categoryLabel}</dt>
						<dd class="text-ink-muted dark:text-snow-muted">
							${messages.projects.category[project.category]}
						</dd>
					</div>
					<div class="flex gap-1.5">
						<dt>${messages.projects.licenseLabel}</dt>
						<dd class="text-ink-muted dark:text-snow-muted">
							${project.license}
						</dd>
					</div>
				</dl>
				<p class="jp-meta mt-5 flex flex-wrap gap-x-6 gap-y-1">
					${externalLink(project.repositoryUrl, messages.projects.repository, messages)}
					${
						project.websiteUrl !== undefined
							? externalLink(
									project.websiteUrl,
									messages.projects.website,
									messages,
								)
							: null
					}
				</p>
			</div>
		</div>
	</article>`;
}

/**
 * Blog row used on the blog index and the home page.
 *
 * `data-slug` is load-bearing: the jp-blog-list island compares the
 * rendered slugs against the runtime manifest and re-renders this exact
 * markup for posts published after the build.
 */
export function blogCard(
	post: BlogManifestEntry,
	locale: Locale,
	messages: AppMessages,
	options: { headingLevel?: 'h2' | 'h3' } = {},
): SafeHtml {
	const heading = options.headingLevel ?? 'h3';
	const path = blogPostPath(locale, post.slug);
	const minutes = readingTime(post.readingMinutes, messages);
	// `data-tags` lets the tag filter match without re-reading the rendered
	// tag list, and keeps matching on the raw tag rather than its displayed
	// form.
	return html`<article
		data-slug="${post.slug}"
		data-tags="${tagAttribute(post.tags)}"
		class="${css.ROW}"
	>
		<div class="${css.ROW_GRID}">
			<div class="${css.ROW_ASIDE}">
				<p class="${css.META}">
					<time datetime="${post.publishedAt}"
						>${formatIsoDate(post.publishedAt, locale)}</time
					>${minutes !== null ? html`${SEPARATOR}${minutes}` : null}
				</p>
			</div>
			<div class="${css.ROW_MAIN}">
				<${raw(heading)} class="${css.ROW_TITLE}">
					<a href="${path}" class="${css.ROW_LINK}">${post.title}</a>
				</${raw(heading)}>
				<p class="${css.ROW_TEXT}">${post.description}</p>
				${post.tags.length > 0 ? techTags(post.tags, messages.blog.tagsLabel) : null}
			</div>
		</div>
	</article>`;
}

/** Renders "N min read", or nothing when no estimate is available. */
export function readingTime(
	minutes: number | undefined,
	messages: AppMessages,
): SafeHtml | null {
	if (minutes === undefined || minutes < 1) {
		return null;
	}
	return html`<span
		>${formatMessage(messages.blog.readingTime, { count: minutes })}</span
	>`;
}

/** Formats the "Published on … · Updated on … · N min read" metadata line. */
export function postDates(
	post: {
		publishedAt: string;
		updatedAt?: string | undefined;
		readingMinutes?: number | undefined;
	},
	locale: Locale,
	messages: AppMessages,
): SafeHtml {
	const published = formatMessage(messages.blog.publishedOn, {
		date: formatIsoDate(post.publishedAt, locale),
	});
	const updated =
		post.updatedAt !== undefined && post.updatedAt !== post.publishedAt
			? formatMessage(messages.blog.updatedOn, {
					date: formatIsoDate(post.updatedAt, locale),
				})
			: undefined;
	const minutes = readingTime(post.readingMinutes, messages);
	return html`<p
		class="jp-meta text-ink-muted dark:text-snow-muted flex flex-wrap items-baseline gap-x-2"
	>
		<time datetime="${post.publishedAt}">${published}</time>${
			updated !== undefined
				? html`${SEPARATOR}<time datetime="${post.updatedAt ?? ''}"
							>${updated}</time
						>`
				: null
		}${minutes !== null ? html`${SEPARATOR}${minutes}` : null}
	</p>`;
}

/** Text link that points onward, with a trailing arrow. */
export function arrowLink(href: string, label: string): SafeHtml {
	return html`<a
		href="${href}"
		class="jp-link inline-flex min-h-11 items-center gap-2"
		>${label}${ARROW}</a
	>`;
}
