import { OWNER, pagePath } from '@/app/configuration';
import { expertiseTopics } from '@/content/skills';
import { ENTITY_ID, pageGraphJsonLd } from '@/domain/services/seo';
import type { RenderContext } from '@/render/layout';
import { breadcrumbs, externalLink } from '@/render/ui';
import { html } from '@/utils/html';
import type { RenderedPage } from './types';

export function renderAboutPage(ctx: RenderContext): RenderedPage {
	const { messages, locale } = ctx;
	const meta = {
		locale,
		path: ctx.path,
		title: messages.about.title,
		description: messages.about.description,
	};
	const trail = [
		{ name: messages.nav.home, path: pagePath(locale, 'home') },
		{ name: messages.nav.about, path: ctx.path },
	];
	const main = html`
		<div class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
			${breadcrumbs(trail, messages)}
			<h1 class="jp-display text-4xl sm:text-6xl">${messages.about.heading}</h1>
			<div class="mt-10 space-y-6">
				${messages.about.intro.map(
					(paragraph) =>
						html`<p
							class="text-ink-muted dark:text-snow-muted max-w-[58ch] text-lg leading-relaxed"
						>
							${paragraph}
						</p>`,
				)}
			</div>

			<h2
				class="jp-label text-ink-muted dark:text-snow-muted border-line dark:border-night-line mt-20 border-t pt-6"
			>
				${messages.about.valuesHeading}
			</h2>
			<dl class="border-line dark:border-night-line border-b">
				${messages.about.values.map(
					(value, index) =>
						html`<div
							class="border-line dark:border-night-line grid gap-x-10 gap-y-2 border-t py-7 md:grid-cols-12"
						>
							<dt class="jp-title md:col-span-4">
								<span
									class="jp-label text-ink-muted dark:text-snow-muted mr-3"
									aria-hidden="true"
									>${String(index + 1).padStart(2, '0')}</span
								>${value.heading}
							</dt>
							<dd
								class="text-ink-muted dark:text-snow-muted leading-relaxed md:col-span-7 md:col-start-6"
							>
								${value.text}
							</dd>
						</div>`,
				)}
			</dl>

			<h2
				class="jp-label text-ink-muted dark:text-snow-muted border-line dark:border-night-line mt-20 border-t pt-6"
			>
				${messages.about.ossHeading}
			</h2>
			<p
				class="text-ink-muted dark:text-snow-muted mt-6 max-w-[58ch] leading-relaxed"
			>
				${messages.about.ossText}
			</p>
			<p class="jp-meta mt-6">
				${externalLink(OWNER.gitHubUrl, `GitHub — ${OWNER.alias}`, messages)}
			</p>
		</div>
	`;
	return {
		meta: {
			...meta,
			jsonLd: [
				pageGraphJsonLd({
					meta,
					pageType: 'AboutPage',
					about: ENTITY_ID.person,
					personDescription: messages.about.description,
					knowsAbout: expertiseTopics(),
					breadcrumb: trail,
				}),
			],
		},
		main,
	};
}
