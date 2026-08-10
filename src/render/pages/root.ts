import { OWNER } from '@/app/configuration';
import { expertiseTopics } from '@/content/skills';
import { ENTITY_ID, pageGraphJsonLd } from '@/domain/services/seo';
import type { RenderContext } from '@/render/layout';
import { siteLogo } from '@/render/logo';
import { html } from '@/utils/html';
import type { RenderedPage } from './types';

/**
 * Root locale-decision page (`/`). With JavaScript, `locale-redirect.ts`
 * navigates to the stored preference or the negotiated browser language
 * (fallback: German). Without JavaScript, both locale entry points are
 * visible immediately — nobody is trapped.
 */
export function renderRootPage(ctx: RenderContext): RenderedPage {
	const meta = {
		locale: ctx.locale,
		path: '/',
		title: `${OWNER.name} — ${OWNER.alias}`,
		description:
			'Jonas Pfalzgraf (JosunLP), Full-Stack-Entwickler und Open-Source-Maintainer. Diese Website gibt es auf Deutsch und Englisch. / Also available in English.',
	};
	return {
		meta: {
			...meta,
			jsonLd: [
				pageGraphJsonLd({
					meta,
					mainEntity: ENTITY_ID.person,
					about: ENTITY_ID.person,
					knowsAbout: expertiseTopics(),
				}),
			],
		},
		main: html`
			<main
				id="main-content"
				class="flex min-h-screen items-center justify-center px-4"
			>
				<div class="max-w-md space-y-8 text-center">
					${siteLogo(96, 'mx-auto h-24 w-24')}
					<h1 class="text-3xl font-semibold tracking-tight">${OWNER.name}</h1>
					<p class="text-ink-muted dark:text-snow-muted">
						<span lang="de"
							>Diese Website ist auf Deutsch und Englisch verfügbar.</span
						>
						<span lang="en" class="mt-1 block"
							>This website is available in German and English.</span
						>
					</p>
					<nav aria-label="Sprache / Language">
						<ul class="flex justify-center gap-4">
							<li>
								<a
									href="/de/"
									hreflang="de"
									lang="de"
									class="bg-accent hover:bg-accent-strong dark:bg-accent-dark dark:text-night inline-flex min-h-11 items-center rounded-full px-6 py-2.5 font-medium text-white"
									>Deutsch</a
								>
							</li>
							<li>
								<a
									href="/en/"
									hreflang="en"
									lang="en"
									class="border-line dark:border-night-line hover:border-accent hover:text-accent dark:hover:border-accent-dark dark:hover:text-accent-dark inline-flex min-h-11 items-center rounded-full border px-6 py-2.5 font-medium"
									>English</a
								>
							</li>
						</ul>
					</nav>
				</div>
			</main>
		`,
		options: {
			bare: true,
			langOverride: 'de',
			extraScripts: ['locale-redirect'],
		},
	};
}
