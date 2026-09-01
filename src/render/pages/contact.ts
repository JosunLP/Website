import { OWNER, pagePath } from '@/app/configuration';
import { pageGraphJsonLd } from '@/domain/services/seo';
import type { RenderContext } from '@/render/layout';
import { breadcrumbs, externalLink } from '@/render/ui';
import { html } from '@/utils/html';
import type { RenderedPage } from './types';

export function renderContactPage(ctx: RenderContext): RenderedPage {
	const { messages, locale } = ctx;
	const meta = {
		locale,
		path: ctx.path,
		title: messages.contact.title,
		description: messages.contact.description,
	};
	const mailLink = (address: string): ReturnType<typeof html> =>
		html`<a href="mailto:${address}" class="jp-link">${address}</a>`;
	const trail = [
		{ name: messages.nav.home, path: pagePath(locale, 'home') },
		{ name: messages.nav.contact, path: ctx.path },
	];
	const main = html`
		<div class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
			${breadcrumbs(trail, messages)}
			<h1 class="jp-display text-4xl sm:text-6xl">
				${messages.contact.heading}
			</h1>
			<p
				class="text-ink-muted dark:text-snow-muted mt-8 max-w-[52ch] text-lg leading-relaxed"
			>
				${messages.contact.intro}
			</p>

			<div class="border-line dark:border-night-line mt-16 border-b">
				<section
					class="border-line dark:border-night-line grid gap-x-10 gap-y-2 border-t py-8 md:grid-cols-12"
					aria-labelledby="contact-general"
				>
					<h2
						id="contact-general"
						class="jp-label text-ink-muted dark:text-snow-muted md:col-span-4"
					>
						${messages.contact.generalHeading}
					</h2>
					<p
						class="text-ink-muted dark:text-snow-muted leading-relaxed md:col-span-7 md:col-start-6"
					>
						${messages.contact.generalText} ${mailLink(OWNER.email)}.
					</p>
				</section>
				<section
					class="border-line dark:border-night-line grid gap-x-10 gap-y-2 border-t py-8 md:grid-cols-12"
					aria-labelledby="contact-support"
				>
					<h2
						id="contact-support"
						class="jp-label text-ink-muted dark:text-snow-muted md:col-span-4"
					>
						${messages.contact.supportHeading}
					</h2>
					<div class="md:col-span-7 md:col-start-6">
						<p class="text-ink-muted dark:text-snow-muted leading-relaxed">
							${messages.contact.supportText} ${mailLink(OWNER.supportEmail)}.
						</p>
						<p class="jp-meta mt-4">
							${externalLink(OWNER.gitHubUrl, `GitHub — ${OWNER.alias}`, messages)}
						</p>
					</div>
				</section>
			</div>

			<p
				class="jp-meta text-ink-muted dark:text-snow-muted mt-10 leading-relaxed"
			>
				${messages.contact.privacyNote}
				<a href="${pagePath(locale, 'privacy')}" class="jp-link"
					>${messages.nav.privacy}</a
				>
			</p>
		</div>
	`;
	return {
		meta: {
			...meta,
			jsonLd: [
				pageGraphJsonLd({
					meta,
					pageType: 'ContactPage',
					breadcrumb: trail,
				}),
			],
		},
		main,
	};
}
