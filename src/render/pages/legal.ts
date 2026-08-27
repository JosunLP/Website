import { pagePath, type PageId } from '@/app/configuration';
import type { LegalPageContent } from '@/content/pages/legal';
import { pageGraphJsonLd } from '@/domain/services/seo';
import { formatIsoDate } from '@/features/i18n';
import type { RenderContext } from '@/render/layout';
import { breadcrumbs } from '@/render/ui';
import { html } from '@/utils/html';
import type { RenderedPage } from './types';

/**
 * Generic renderer for legal pages (imprint, privacy, accessibility
 * statement). Content comes from typed, owner-supplied copy that is not
 * legally reviewed — see docs/OWNER_ACTION_REQUIRED.md.
 *
 * Paragraphs the owner has not filled in yet are empty strings. They are
 * dropped here, along with any section left without a paragraph, so an
 * open item never ships as a heading with nothing under it.
 */
export function renderLegalPage(
	ctx: RenderContext,
	page: PageId,
	content: LegalPageContent,
): RenderedPage {
	const { messages, locale } = ctx;
	const meta = {
		locale,
		path: ctx.path,
		title: content.title[locale],
		description: content.metaDescription[locale],
	};
	const trail = [
		{ name: messages.nav.home, path: pagePath(locale, 'home') },
		{ name: messages.nav[page], path: ctx.path },
	];
	const main = html`
		<div class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
			${breadcrumbs(trail, messages)}
			<h1 class="text-4xl font-semibold tracking-tight">
				${content.heading[locale]}
			</h1>
			${content.sections.map((section, index) => {
				const paragraphs = section.paragraphs[locale].filter(
					(paragraph) => paragraph.trim() !== '',
				);
				if (paragraphs.length === 0) {
					return '';
				}
				// Numbered ids stay tied to the section's position in the source
				// so they do not shift when an unanswered section drops out.
				const id = section.anchor ?? `section-${String(index + 1)}`;
				return html`<section class="mt-10" aria-labelledby="${id}">
					<h2 id="${id}" class="text-2xl font-semibold tracking-tight">
						${section.heading[locale]}
					</h2>
					${paragraphs.map(
						(paragraph) =>
							html`<p
								class="text-ink-muted dark:text-snow-muted mt-4 leading-relaxed whitespace-pre-line"
							>
								${paragraph}
							</p>`,
					)}
				</section>`;
			})}
			<p class="text-ink-muted dark:text-snow-muted mt-12 text-sm">
				${locale === 'de' ? 'Stand' : 'Last reviewed'}:
				<time datetime="${content.reviewedAt}"
					>${formatIsoDate(content.reviewedAt, locale)}</time
				>
			</p>
		</div>
	`;
	return {
		meta: {
			...meta,
			jsonLd: [pageGraphJsonLd({ meta, breadcrumb: trail })],
		},
		main,
	};
}
