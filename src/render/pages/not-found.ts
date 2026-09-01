import { pagePath } from '@/app/configuration';
import type { RenderContext } from '@/render/layout';
import { buttonLink } from '@/render/ui';
import { html } from '@/utils/html';
import type { RenderedPage } from './types';

/**
 * 404 page. A single page serves both locales: it renders the current
 * locale's copy (per prerendered variant) and always offers both home
 * pages, since the requested URL may not carry a locale.
 */
export function renderNotFoundPage(ctx: RenderContext): RenderedPage {
	const { messages, locale } = ctx;
	return {
		meta: {
			locale,
			path: `/${locale}/404.html`,
			title: messages.notFound.title,
			description: messages.notFound.description,
			noindex: true,
		},
		main: html`
			<div class="mx-auto max-w-3xl px-4 py-32 sm:px-6">
				<p
					class="jp-label text-accent dark:text-accent-dark"
					aria-hidden="true"
				>
					404
				</p>
				<h1 class="jp-display mt-6 text-4xl sm:text-6xl">
					${messages.notFound.heading}
				</h1>
				<p
					class="text-ink-muted dark:text-snow-muted mt-8 max-w-[52ch] text-lg leading-relaxed"
				>
					${messages.notFound.text}
				</p>
				<p class="mt-10">
					${buttonLink(pagePath(locale, 'home'), messages.notFound.backHome)}
				</p>
			</div>
		`,
	};
}
