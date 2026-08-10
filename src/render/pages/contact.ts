import { OWNER, pagePath } from '@/app/configuration';
import { breadcrumbJsonLd, webPageJsonLd } from '@/domain/services/seo';
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
		html`<a
			href="mailto:${address}"
			class="text-accent dark:text-accent-dark font-medium underline underline-offset-2 hover:no-underline"
			>${address}</a
		>`;
	const trail = [
		{ name: messages.nav.home, path: pagePath(locale, 'home') },
		{ name: messages.nav.contact, path: ctx.path },
	];
	const main = html`
		<div class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
			${breadcrumbs(trail, messages)}
			<h1 class="text-4xl font-semibold tracking-tight">
				${messages.contact.heading}
			</h1>
			<p
				class="text-ink-muted dark:text-snow-muted mt-4 text-lg leading-relaxed"
			>
				${messages.contact.intro}
			</p>

			<div class="mt-12 grid gap-6 sm:grid-cols-2">
				<section
					class="rounded-card border-line dark:border-night-line border p-6"
					aria-labelledby="contact-general"
				>
					<h2 id="contact-general" class="text-lg font-semibold">
						${messages.contact.generalHeading}
					</h2>
					<p class="text-ink-muted dark:text-snow-muted mt-2 leading-relaxed">
						${messages.contact.generalText} ${mailLink(OWNER.email)}.
					</p>
				</section>
				<section
					class="rounded-card border-line dark:border-night-line border p-6"
					aria-labelledby="contact-support"
				>
					<h2 id="contact-support" class="text-lg font-semibold">
						${messages.contact.supportHeading}
					</h2>
					<p class="text-ink-muted dark:text-snow-muted mt-2 leading-relaxed">
						${messages.contact.supportText} ${mailLink(OWNER.supportEmail)}.
					</p>
					<p class="mt-3 text-sm">
						${externalLink(OWNER.gitHubUrl, `GitHub — ${OWNER.alias}`, messages)}
					</p>
				</section>
			</div>

			<p
				class="text-ink-muted dark:text-snow-muted mt-10 text-sm leading-relaxed"
			>
				${messages.contact.privacyNote}
				<a
					href="${pagePath(locale, 'privacy')}"
					class="underline underline-offset-2 hover:no-underline"
					>${messages.nav.privacy}</a
				>
			</p>
		</div>
	`;
	return {
		meta: {
			...meta,
			jsonLd: [webPageJsonLd(meta), breadcrumbJsonLd(trail)],
		},
		main,
	};
}
