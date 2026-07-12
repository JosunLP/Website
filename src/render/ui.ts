import type { BlogManifestEntry } from '@/domain/models/blog';
import type { Locale } from '@/domain/models/locale';
import type { Project } from '@/domain/models/project';
import { blogPostPath } from '@/app/configuration';
import { formatIsoDate, formatMessage } from '@/features/i18n';
import type { AppMessages } from '@/features/i18n/messages';
import { html, raw, type SafeHtml } from '@/utils/html';

/**
 * Reusable presentational partials. Pure functions: typed data in,
 * escaped HTML out. Interactive behavior lives in the `jp-*` Web
 * Components that enhance this markup client-side.
 */

/** External links: new tab + safe rel + visually hidden hint. */
export function externalLink(
	href: string,
	label: string,
	messages: AppMessages,
	classes = 'text-accent dark:text-accent-dark underline underline-offset-2 hover:no-underline',
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

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
	primary:
		'jp-btn inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 py-2.5 font-medium text-white transition-colors duration-swift hover:bg-accent-strong dark:bg-accent-dark dark:text-night dark:hover:bg-accent-soft',
	secondary:
		'jp-btn inline-flex min-h-11 items-center justify-center rounded-full border border-line px-6 py-2.5 font-medium text-ink transition-colors duration-swift hover:border-accent hover:text-accent dark:border-night-line dark:text-snow dark:hover:border-accent-dark dark:hover:text-accent-dark',
};

export function buttonLink(
	href: string,
	label: string,
	variant: ButtonVariant = 'primary',
): SafeHtml {
	return html`<a href="${href}" class="${BUTTON_CLASSES[variant]}"
		>${label}</a
	>`;
}

/** Section heading with an eyebrow-style kicker. */
export function sectionHeading(
	id: string,
	kicker: string,
	title: string,
): SafeHtml {
	return html`<div class="mb-10">
		<p
			class="text-accent dark:text-accent-dark mb-2 text-sm font-semibold tracking-widest uppercase"
			aria-hidden="true"
		>
			${kicker}
		</p>
		<h2 id="${id}" class="text-3xl font-semibold tracking-tight sm:text-4xl">
			${title}
		</h2>
	</div>`;
}

/** Technology tag list. */
export function techTags(
	technologies: readonly string[],
	label: string,
): SafeHtml {
	return html`<ul class="flex flex-wrap gap-2" aria-label="${label}">
		${technologies.map(
			(tech) =>
				html`<li
					class="rounded-tag border-line text-ink-muted dark:border-night-line dark:text-snow-muted border px-2.5 py-1 text-xs font-medium"
				>
					${tech}
				</li>`,
		)}
	</ul>`;
}

/** Status badge; conveys state through text, not color alone. */
export function statusBadge(
	status: Project['status'],
	messages: AppMessages,
): SafeHtml {
	const label = messages.projects.status[status];
	return html`<span
		class="border-line dark:border-night-line text-ink-muted dark:text-snow-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
		>${
			status === 'active'
				? raw(
						'<span class="h-1.5 w-1.5 rounded-full bg-accent dark:bg-accent-dark" aria-hidden="true"></span>',
					)
				: null
		}${label}</span
	>`;
}

/**
 * Decorative geometric motif: a small module/connection diagram.
 * Deterministic per seed so each project gets a distinct but stable
 * pattern. Purely decorative (aria-hidden).
 */
export function motif(seed: number, classes: string): SafeHtml {
	const cells: string[] = [];
	let state = seed * 2654435761;
	const rand = (): number => {
		state = (state * 1103515245 + 12345) & 0x7fffffff;
		return state / 0x7fffffff;
	};
	for (let x = 0; x < 6; x += 1) {
		for (let y = 0; y < 3; y += 1) {
			const value = rand();
			if (value > 0.62) {
				cells.push(
					`<rect x="${String(x * 16 + 3)}" y="${String(y * 16 + 3)}" width="10" height="10" rx="2" fill="currentColor" opacity="${value > 0.85 ? '0.9' : '0.35'}"/>`,
				);
			} else if (value > 0.45) {
				cells.push(
					`<circle cx="${String(x * 16 + 8)}" cy="${String(y * 16 + 8)}" r="2.5" fill="currentColor" opacity="0.5"/>`,
				);
			}
		}
	}
	return raw(
		`<svg viewBox="0 0 96 48" class="${classes}" aria-hidden="true" focusable="false">${cells.join('')}</svg>`,
	);
}

/** Project card. Fully keyboard accessible; no hover-only content. */
export function projectCard(
	project: Project,
	locale: Locale,
	messages: AppMessages,
	options: { headingLevel?: 'h3' | 'h2' } = {},
): SafeHtml {
	const heading = options.headingLevel ?? 'h3';
	const seed = project.slug
		.split('')
		.reduce((sum, char) => sum + char.charCodeAt(0), 0);
	return html`<article
		class="jp-card rounded-card border-line bg-paper-raised shadow-card dark:border-night-line dark:bg-night-raised flex h-full flex-col gap-4 border p-6"
	>
		<div class="flex items-start justify-between gap-4">
			${motif(seed, 'jp-card-motif h-8 w-16 text-accent dark:text-accent-dark shrink-0')}
			${statusBadge(project.status, messages)}
		</div>
		<${raw(heading)} class="text-xl font-semibold tracking-tight">
			${externalLink(
				project.repositoryUrl,
				project.name,
				messages,
				'text-ink dark:text-snow hover:text-accent dark:hover:text-accent-dark no-underline',
			)}
		</${raw(heading)}>
		<p class="text-ink-muted dark:text-snow-muted grow leading-relaxed">
			${project.description[locale]}
		</p>
		${techTags(project.technologies, messages.projects.technologiesLabel)}
		<dl class="text-ink-muted dark:text-snow-muted flex flex-wrap gap-x-6 gap-y-1 text-sm">
			<div class="flex gap-1.5">
				<dt>${messages.projects.categoryLabel}:</dt>
				<dd>${messages.projects.category[project.category]}</dd>
			</div>
			<div class="flex gap-1.5">
				<dt>${messages.projects.licenseLabel}:</dt>
				<dd>${project.license}</dd>
			</div>
		</dl>
		<p class="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
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
	</article>`;
}

/** Blog card used on the blog index and the home page. */
export function blogCard(
	post: BlogManifestEntry,
	locale: Locale,
	messages: AppMessages,
	options: { headingLevel?: 'h2' | 'h3' } = {},
): SafeHtml {
	const heading = options.headingLevel ?? 'h3';
	const path = blogPostPath(locale, post.slug);
	return html`<article
		class="jp-card rounded-card border-line bg-paper-raised shadow-card dark:border-night-line dark:bg-night-raised flex h-full flex-col gap-3 border p-6"
	>
		<p class="text-ink-muted dark:text-snow-muted text-sm">
			<time datetime="${post.publishedAt}"
				>${formatIsoDate(post.publishedAt, locale)}</time
			>
		</p>
		<${raw(heading)} class="text-xl font-semibold tracking-tight">
			<a href="${path}" class="hover:text-accent dark:hover:text-accent-dark"
				>${post.title}</a
			>
		</${raw(heading)}>
		<p class="text-ink-muted dark:text-snow-muted grow leading-relaxed">
			${post.description}
		</p>
		${post.tags.length > 0 ? techTags(post.tags, messages.blog.tagsLabel) : null}
		<p>
			<a
				href="${path}"
				class="text-accent dark:text-accent-dark text-sm font-medium underline underline-offset-2 hover:no-underline"
				>${messages.blog.readPost}<span class="sr-only"
					>: ${post.title}</span
				></a
			>
		</p>
	</article>`;
}

/** Note/callout block (used for legal draft notices and blog states). */
export function callout(
	content: SafeHtml | string,
	tone: 'info' | 'warning' = 'info',
): SafeHtml {
	const toneClasses =
		tone === 'warning'
			? 'border-amber-600/50 bg-amber-50 text-amber-950 dark:border-amber-400/40 dark:bg-amber-950/40 dark:text-amber-100'
			: 'border-accent/40 bg-accent-soft/50 text-ink dark:border-accent-dark/40 dark:bg-accent-dark-soft/50 dark:text-snow';
	return html`<div
		class="${`rounded-card border p-4 text-sm leading-relaxed ${toneClasses}`}"
	>
		${content}
	</div>`;
}

/** Formats "Published on …" / "Updated on …" metadata line. */
export function postDates(
	post: { publishedAt: string; updatedAt?: string | undefined },
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
	return html`<p class="text-ink-muted dark:text-snow-muted text-sm">
		<time datetime="${post.publishedAt}">${published}</time>${
			updated !== undefined
				? html` · <time datetime="${post.updatedAt ?? ''}">${updated}</time>`
				: null
		}
	</p>`;
}
