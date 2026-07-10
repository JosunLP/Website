import { pagePath, type PageId } from '@/app/configuration';
import type { LegalPageContent } from '@/content/pages/legal';
import { breadcrumbJsonLd, webPageJsonLd } from '@/domain/services/seo';
import { formatIsoDate } from '@/features/i18n';
import type { RenderContext } from '@/render/layout';
import { callout } from '@/render/ui';
import { html } from '@/utils/html';
import type { RenderedPage } from './types';

/**
 * Generic renderer for legal pages (imprint, privacy, accessibility
 * statement). Content comes from typed draft templates with visible
 * `[[OWNER: …]]` placeholders — see docs/OWNER_ACTION_REQUIRED.md.
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
	const main = html`
		<div class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
			<h1 class="text-4xl font-semibold tracking-tight">
				${content.heading[locale]}
			</h1>
			<div class="mt-6">${callout(messages.legalDraftNotice, 'warning')}</div>
			${content.sections.map((section, index) => {
				// The privacy page's local-preferences section is the target of
				// the footer "Privacy preferences" link.
				const id =
					page === 'privacy' && index === 3
						? 'local-preferences'
						: `section-${String(index + 1)}`;
				return html`<section class="mt-10" aria-labelledby="${id}">
					<h2 id="${id}" class="text-2xl font-semibold tracking-tight">
						${section.heading[locale]}
					</h2>
					${section.paragraphs[locale].map(
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
			jsonLd: [
				webPageJsonLd(meta),
				breadcrumbJsonLd([
					{ name: messages.nav.home, path: pagePath(locale, 'home') },
					{ name: messages.nav[page], path: ctx.path },
				]),
			],
		},
		main,
	};
}
