import { OWNER, pagePath } from '@/app/configuration';
import {
	breadcrumbJsonLd,
	personJsonLd,
	webPageJsonLd,
} from '@/domain/services/seo';
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
			<h1 class="text-4xl font-semibold tracking-tight">
				${messages.about.heading}
			</h1>
			<div class="mt-8 space-y-5">
				${messages.about.intro.map(
					(paragraph) =>
						html`<p
							class="text-ink-muted dark:text-snow-muted text-lg leading-relaxed"
						>
							${paragraph}
						</p>`,
				)}
			</div>

			<h2 class="mt-16 text-2xl font-semibold tracking-tight">
				${messages.about.valuesHeading}
			</h2>
			<dl class="mt-8 grid gap-6 sm:grid-cols-2">
				${messages.about.values.map(
					(value) =>
						html`<div
							class="rounded-card border-line dark:border-night-line border p-6"
						>
							<dt class="font-semibold">${value.heading}</dt>
							<dd
								class="text-ink-muted dark:text-snow-muted mt-2 leading-relaxed"
							>
								${value.text}
							</dd>
						</div>`,
				)}
			</dl>

			<h2 class="mt-16 text-2xl font-semibold tracking-tight">
				${messages.about.ossHeading}
			</h2>
			<p class="text-ink-muted dark:text-snow-muted mt-4 leading-relaxed">
				${messages.about.ossText}
			</p>
			<p class="mt-4">
				${externalLink(OWNER.gitHubUrl, `GitHub — ${OWNER.alias}`, messages)}
			</p>
		</div>
	`;
	return {
		meta: {
			...meta,
			jsonLd: [personJsonLd(), webPageJsonLd(meta), breadcrumbJsonLd(trail)],
		},
		main,
	};
}
